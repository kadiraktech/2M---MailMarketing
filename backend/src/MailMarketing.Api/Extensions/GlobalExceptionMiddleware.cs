using System.Net;
using System.Text.Json;

namespace MailMarketing.Api.Extensions;

public sealed class GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            var (statusCode, title) = ex switch
            {
                InvalidOperationException => ((int)HttpStatusCode.BadRequest, "Invalid operation"),
                UnauthorizedAccessException => ((int)HttpStatusCode.Unauthorized, "Unauthorized"),
                _ => ((int)HttpStatusCode.InternalServerError, "Internal server error")
            };

            var traceId = context.TraceIdentifier;
            logger.LogError(ex, "Request failed. StatusCode={StatusCode}, TraceId={TraceId}", statusCode, traceId);

            context.Response.StatusCode = statusCode;
            context.Response.ContentType = "application/json";

            var payload = JsonSerializer.Serialize(new
            {
                title,
                message = ex.Message,
                traceId
            });

            await context.Response.WriteAsync(payload);
        }
    }
}
