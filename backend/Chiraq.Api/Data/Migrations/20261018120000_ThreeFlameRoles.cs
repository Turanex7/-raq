using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Chiraq.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class ThreeFlameRoles : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Answer",
                table: "CoopParticipants",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "AnsweredAtUtc",
                table: "CoopParticipants",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Role",
                table: "CoopParticipants",
                type: "TEXT",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Answer",
                table: "CoopParticipants");

            migrationBuilder.DropColumn(
                name: "AnsweredAtUtc",
                table: "CoopParticipants");

            migrationBuilder.DropColumn(
                name: "Role",
                table: "CoopParticipants");
        }
    }
}
