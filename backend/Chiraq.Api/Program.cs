using System.Threading.RateLimiting;
using Chiraq.Api;
using Chiraq.Api.Data;
using Chiraq.Api.Security;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<AppDbContext>(options => options.UseSqlite(
    builder.Configuration.GetConnectionString("Chiraq") ?? "Data Source=chiraq.db;Foreign Keys=True"));
builder.Services.AddSingleton<Tokens>();
builder.Services.AddHostedService<SeasonRolloverService>();
builder.Services.Configure<RouteHandlerOptions>(options => options.ThrowOnBadRequest = true);
builder.Services.AddCors(options => options.AddPolicy("frontend", policy => policy
    .WithOrigins(builder.Configuration.GetSection("CORS_ORIGINS").Get<string[]>() ?? ["http://localhost:5173"])
    .AllowAnyHeader().AllowAnyMethod()));
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.OnRejected = async (context, cancellationToken) =>
    {
        context.HttpContext.Response.ContentType = "application/json";
        await context.HttpContext.Response.WriteAsJsonAsync(new { error = new { code = "rate_limited", message = "Sorğu sayının həddinə çatmısan. Bir az sonra yenidən cəhd et." } }, cancellationToken);
    };
    options.AddPolicy("auth", context => RateLimitPartition.GetFixedWindowLimiter(
        context.Connection.RemoteIpAddress?.ToString() ?? "unknown", _ => new FixedWindowRateLimiterOptions
        { PermitLimit = 10, Window = TimeSpan.FromMinutes(10), QueueLimit = 0, AutoReplenishment = true }));
    options.AddPolicy("checkin", context => RateLimitPartition.GetFixedWindowLimiter(
        context.Connection.RemoteIpAddress?.ToString() ?? "unknown", _ => new FixedWindowRateLimiterOptions
        { PermitLimit = GameRules.MaximumCheckinsPerHour, Window = TimeSpan.FromHours(1), QueueLimit = 0, AutoReplenishment = true }));
    options.AddPolicy("complete", context => RateLimitPartition.GetFixedWindowLimiter(
        context.Connection.RemoteIpAddress?.ToString() ?? "unknown", _ => new FixedWindowRateLimiterOptions
        { PermitLimit = GameRules.MaximumCompletionsPerHour, Window = TimeSpan.FromHours(1), QueueLimit = 0, AutoReplenishment = true }));
});

var app = builder.Build();
app.Use(async (context, next) =>
{
    var logger = context.RequestServices.GetRequiredService<ILoggerFactory>().CreateLogger("HttpRequest");
    var started = System.Diagnostics.Stopwatch.StartNew();
    try { await next(); }
    catch (ArgumentException ex)
    {
        context.Response.StatusCode = 400;
        await context.Response.WriteAsJsonAsync(new { error = new { code = "invalid_request", message = ex.Message } });
    }
    catch (BadHttpRequestException)
    {
        context.Response.StatusCode = 400;
        await context.Response.WriteAsJsonAsync(new { error = new { code = "invalid_request", message = "Sorğunun JSON formatı və ya sahələri yanlışdır." } });
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Unhandled request failure for {Method} {Path}", context.Request.Method, context.Request.Path);
        if (!context.Response.HasStarted)
        {
            context.Response.StatusCode = 500;
            await context.Response.WriteAsJsonAsync(new { error = new { code = "internal_error", message = "Sorğu icra edilərkən xəta baş verdi." } });
        }
    }
    finally { logger.LogInformation("{Method} {Path} responded {StatusCode} in {ElapsedMs}ms", context.Request.Method, context.Request.Path, context.Response.StatusCode, started.ElapsedMilliseconds); }
});
app.UseCors("frontend");
app.UseRateLimiter();

await using (var scope = app.Services.CreateAsyncScope())
    await DbSeeder.InitializeAsync(scope.ServiceProvider.GetRequiredService<AppDbContext>(), app.Configuration);

app.MapGet("/api/health", () => Results.Ok(new { status = "ok", service = "chiraq-api", timeUtc = DateTimeOffset.UtcNow }));
app.MapChiraqApi();
app.MapGet("/", () => Results.Redirect("/api/health"));
app.Run();

public partial class Program;
