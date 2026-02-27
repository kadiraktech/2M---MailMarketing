using MailMarketing.Domain.Entities;
using MailMarketing.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace MailMarketing.Data.Persistence;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<AppUser> AppUsers => Set<AppUser>();
    public DbSet<Subscriber> Subscribers => Set<Subscriber>();
    public DbSet<Template> Templates => Set<Template>();
    public DbSet<SmtpSetting> SmtpSettings => Set<SmtpSetting>();
    public DbSet<SendBatch> SendBatches => Set<SendBatch>();
    public DbSet<SendItem> SendItems => Set<SendItem>();
    public DbSet<SendJobQueue> SendJobQueues => Set<SendJobQueue>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);

        modelBuilder.Entity<AppUser>(b =>
        {
            b.ToTable("app_users");
            b.HasKey(x => x.Id);
            b.Property(x => x.FullName).HasMaxLength(200).IsRequired();
            b.Property(x => x.Email).HasMaxLength(320).IsRequired();
            b.Property(x => x.PasswordHash).HasMaxLength(2000).IsRequired();
            b.Property(x => x.Role).HasConversion<string>().HasMaxLength(20).IsRequired();
            b.HasIndex(x => x.Email).IsUnique();
        });

        modelBuilder.Entity<Subscriber>(b =>
        {
            b.ToTable("subscribers");
            b.HasKey(x => x.Id);
            b.Property(x => x.Email).HasMaxLength(320).IsRequired();
            b.Property(x => x.FullName).HasMaxLength(200);
            b.HasIndex(x => x.Email).IsUnique();
        });

        modelBuilder.Entity<Template>(b =>
        {
            b.ToTable("templates");
            b.HasKey(x => x.Id);
            b.Property(x => x.Name).HasMaxLength(200).IsRequired();
            b.Property(x => x.Subject).HasMaxLength(250).IsRequired();
            b.Property(x => x.HtmlContent).IsRequired();
            b.Property(x => x.IsActive).IsRequired().HasDefaultValue(true);

            b.HasOne(x => x.CreatedByUser)
                .WithMany(u => u.Templates)
                .HasForeignKey(x => x.CreatedByUserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<SmtpSetting>(b =>
        {
            b.ToTable("smtp_settings");
            b.HasKey(x => x.Id);
            b.Property(x => x.Host).HasMaxLength(200).IsRequired();
            b.Property(x => x.Username).HasMaxLength(200).IsRequired();
            b.Property(x => x.PasswordEncrypted).HasMaxLength(500).IsRequired();
            b.Property(x => x.FromEmail).HasMaxLength(320).IsRequired();
            b.HasIndex(x => x.FromEmail).IsUnique();
        });

        modelBuilder.Entity<SendBatch>(b =>
        {
            b.ToTable("send_batches");
            b.HasKey(x => x.Id);
            b.Property(x => x.SubjectSnapshot).HasMaxLength(250).IsRequired();
            b.Property(x => x.Status).HasConversion<string>().HasMaxLength(30).IsRequired();

            b.HasOne(x => x.Template)
                .WithMany(t => t.SendBatches)
                .HasForeignKey(x => x.TemplateId)
                .OnDelete(DeleteBehavior.Restrict);

            b.HasOne(x => x.CreatedByUser)
                .WithMany(u => u.Batches)
                .HasForeignKey(x => x.CreatedByUserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<SendItem>(b =>
        {
            b.ToTable("send_items");
            b.HasKey(x => x.Id);
            b.Property(x => x.Status).HasConversion<string>().HasMaxLength(30).IsRequired();
            b.Property(x => x.ErrorMessage).HasMaxLength(1000);

            b.HasOne(x => x.Batch)
                .WithMany(s => s.Items)
                .HasForeignKey(x => x.BatchId)
                .OnDelete(DeleteBehavior.Restrict);

            b.HasOne(x => x.Subscriber)
                .WithMany(s => s.SendItems)
                .HasForeignKey(x => x.SubscriberId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<SendJobQueue>(b =>
        {
            b.ToTable("send_job_queue");
            b.HasKey(x => x.Id);
            b.Property(x => x.Status).HasConversion<string>().HasMaxLength(30).IsRequired();
            b.Property(x => x.ErrorMessage).HasMaxLength(1000);

            b.HasOne(x => x.SendItem)
                .WithMany(i => i.QueueEntries)
                .HasForeignKey(x => x.SendItemId)
                .OnDelete(DeleteBehavior.Restrict);

            b.HasIndex(x => new { x.Status, x.AvailableAtUtc });
        });

        base.OnModelCreating(modelBuilder);
    }
}

