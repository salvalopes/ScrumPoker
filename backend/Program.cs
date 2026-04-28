using backend.Services;

var builder = WebApplication.CreateBuilder(args);
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];

builder.Services.AddControllers();
builder.Services.AddSignalR();
builder.Services.AddSingleton<IPokerRoomService, PokerRoomService>();
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        if (allowedOrigins.Length == 0)
        {
            policy
                .AllowAnyHeader()
                .AllowAnyMethod();

            return;
        }

        policy
            .WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

var app = builder.Build();

app.UseCors("Frontend");
app.UseAuthorization();

app.MapControllers();
app.MapHub<backend.Hubs.PokerHub>("/hubs/poker");

app.Run();
