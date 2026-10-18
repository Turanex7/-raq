using Chiraq.Api.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

if (args.Length != 1)
{
    Console.Error.WriteLine("SQLite connection string argument is required.");
    return 2;
}

var options = new DbContextOptionsBuilder<AppDbContext>().UseSqlite(args[0]).Options;
await using var db = new AppDbContext(options);
await DbSeeder.InitializeAsync(db, new ConfigurationBuilder().Build());
Console.WriteLine("Demo bazası yenidən yaradıldı və seed məlumatı əlavə olundu.");
return 0;
