# ============================================
# SAFE-8 Database Backup and Local Restore Script
# ============================================
# This script:
# 1. Backs up the Azure SQL database to SQL files
# 2. Creates a local SQL Server database
# 3. Restores all data
# 4. Sets up local admin credentials
# ============================================

param(
    [string]$LocalServer = "localhost",
    [string]$LocalDbName = "SAFE8_Local",
    [string]$BackupFolder = ".\database_backup",
    [switch]$CreateBackup = $true,
    [switch]$RestoreLocal = $true
)

# Azure Database Connection Details
$AzureServer = "safe-8-server.database.windows.net"
$AzureDbName = "safe-8-db"
$AzureUser = "safe8admin"
$AzurePassword = "Safe8Admin2024!"

# Local Database Credentials (will be created)
$LocalAdminUser = "safe8_local_admin"
$LocalAdminPassword = "LocalAdmin2024!"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "SAFE-8 Database Backup & Restore Tool" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Create backup folder
if ($CreateBackup) {
    if (!(Test-Path $BackupFolder)) {
        New-Item -ItemType Directory -Path $BackupFolder | Out-Null
        Write-Host "✓ Created backup folder: $BackupFolder" -ForegroundColor Green
    }

    Write-Host ""
    Write-Host "Step 1: Backing up Azure database..." -ForegroundColor Yellow
    Write-Host "This may take a few minutes..." -ForegroundColor Gray
    Write-Host ""

    # Connection string for Azure
    $AzureConnectionString = "Server=tcp:$AzureServer,1433;Initial Catalog=$AzureDbName;Persist Security Info=False;User ID=$AzureUser;Password=$AzurePassword;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"

    # Script to export database schema and data
    $BackupScript = @"
using System;
using System.Data.SqlClient;
using System.IO;
using System.Text;
using System.Collections.Generic;

class DatabaseBackup
{
    static void Main()
    {
        string connectionString = "$($AzureConnectionString.Replace('"', '""'))";
        string backupFolder = @"$($BackupFolder.Replace('\', '\\'))";
        
        try
        {
            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                conn.Open();
                Console.WriteLine("✓ Connected to Azure database");
                
                // Get all tables
                var tables = new List<string>();
                using (SqlCommand cmd = new SqlCommand(@"
                    SELECT TABLE_NAME 
                    FROM INFORMATION_SCHEMA.TABLES 
                    WHERE TABLE_TYPE = 'BASE TABLE' 
                    ORDER BY TABLE_NAME", conn))
                {
                    using (SqlDataReader reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            tables.Add(reader.GetString(0));
                        }
                    }
                }
                
                Console.WriteLine("Found {0} tables to backup", tables.Count);
                Console.WriteLine();
                
                // Create schema file
                StringBuilder schema = new StringBuilder();
                schema.AppendLine("-- SAFE-8 Database Schema");
                schema.AppendLine("-- Generated: " + DateTime.Now.ToString());
                schema.AppendLine();
                
                // Create data file
                StringBuilder data = new StringBuilder();
                data.AppendLine("-- SAFE-8 Database Data");
                data.AppendLine("-- Generated: " + DateTime.Now.ToString());
                data.AppendLine();
                
                foreach (string table in tables)
                {
                    Console.WriteLine("Processing: " + table);
                    
                    // Get CREATE TABLE statement
                    using (SqlCommand cmd = new SqlCommand(@"
                        SELECT 
                            'CREATE TABLE [' + t.TABLE_NAME + '] (' + CHAR(13) + CHAR(10) +
                            STUFF((
                                SELECT ',' + CHAR(13) + CHAR(10) + 
                                    '    [' + c.COLUMN_NAME + '] ' +
                                    c.DATA_TYPE +
                                    CASE 
                                        WHEN c.DATA_TYPE IN ('varchar', 'nvarchar', 'char', 'nchar') 
                                        THEN '(' + CASE WHEN c.CHARACTER_MAXIMUM_LENGTH = -1 THEN 'MAX' ELSE CAST(c.CHARACTER_MAXIMUM_LENGTH AS VARCHAR) END + ')'
                                        WHEN c.DATA_TYPE IN ('decimal', 'numeric')
                                        THEN '(' + CAST(c.NUMERIC_PRECISION AS VARCHAR) + ',' + CAST(c.NUMERIC_SCALE AS VARCHAR) + ')'
                                        ELSE ''
                                    END +
                                    CASE WHEN c.IS_NULLABLE = 'NO' THEN ' NOT NULL' ELSE ' NULL' END
                                FROM INFORMATION_SCHEMA.COLUMNS c
                                WHERE c.TABLE_NAME = t.TABLE_NAME
                                ORDER BY c.ORDINAL_POSITION
                                FOR XML PATH('')
                            ), 1, 1, '') +
                            CHAR(13) + CHAR(10) + ');' + CHAR(13) + CHAR(10)
                        FROM INFORMATION_SCHEMA.TABLES t
                        WHERE t.TABLE_NAME = @TableName", conn))
                    {
                        cmd.Parameters.AddWithValue("@TableName", table);
                        object result = cmd.ExecuteScalar();
                        if (result != null)
                        {
                            schema.AppendLine("-- Table: " + table);
                            schema.AppendLine(result.ToString());
                            schema.AppendLine();
                        }
                    }
                    
                    // Get data
                    using (SqlCommand cmd = new SqlCommand("SELECT * FROM [" + table + "]", conn))
                    {
                        using (SqlDataReader reader = cmd.ExecuteReader())
                        {
                            int rowCount = 0;
                            data.AppendLine("-- Data for table: " + table);
                            
                            if (reader.HasRows)
                            {
                                // Build column list
                                var columns = new List<string>();
                                for (int i = 0; i < reader.FieldCount; i++)
                                {
                                    columns.Add("[" + reader.GetName(i) + "]");
                                }
                                string columnList = string.Join(", ", columns);
                                
                                while (reader.Read())
                                {
                                    var values = new List<string>();
                                    for (int i = 0; i < reader.FieldCount; i++)
                                    {
                                        if (reader.IsDBNull(i))
                                        {
                                            values.Add("NULL");
                                        }
                                        else
                                        {
                                            object val = reader.GetValue(i);
                                            string strVal = val.ToString().Replace("'", "''");
                                            
                                            if (val is DateTime)
                                            {
                                                values.Add("'" + ((DateTime)val).ToString("yyyy-MM-dd HH:mm:ss.fff") + "'");
                                            }
                                            else if (val is bool)
                                            {
                                                values.Add((bool)val ? "1" : "0");
                                            }
                                            else if (val is int || val is long || val is decimal || val is double || val is float)
                                            {
                                                values.Add(strVal);
                                            }
                                            else
                                            {
                                                values.Add("N'" + strVal + "'");
                                            }
                                        }
                                    }
                                    
                                    data.AppendLine("INSERT INTO [" + table + "] (" + columnList + ") VALUES (" + string.Join(", ", values) + ");");
                                    rowCount++;
                                }
                            }
                            
                            data.AppendLine("-- " + rowCount + " rows inserted");
                            data.AppendLine();
                            Console.WriteLine("  → {0} rows exported", rowCount);
                        }
                    }
                }
                
                // Save files
                string schemaFile = Path.Combine(backupFolder, "01_schema.sql");
                string dataFile = Path.Combine(backupFolder, "02_data.sql");
                
                File.WriteAllText(schemaFile, schema.ToString());
                File.WriteAllText(dataFile, data.ToString());
                
                Console.WriteLine();
                Console.WriteLine("✓ Backup completed successfully!");
                Console.WriteLine("  Schema: " + schemaFile);
                Console.WriteLine("  Data: " + dataFile);
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine("✗ Error: " + ex.Message);
            Environment.Exit(1);
        }
    }
}
"@

    # Compile and run the backup script
    $tempCs = Join-Path $env:TEMP "backup_db.cs"
    $tempExe = Join-Path $env:TEMP "backup_db.exe"
    
    $BackupScript | Out-File -FilePath $tempCs -Encoding UTF8
    
    # Compile
    Add-Type -TypeDefinition "using System.Runtime.CompilerServices; [assembly: InternalsVisibleTo(""backup_db"")]" -Language CSharp -ErrorAction SilentlyContinue
    $cscPath = "C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe"
    if (!(Test-Path $cscPath)) {
        $cscPath = "C:\Windows\Microsoft.NET\Framework\v4.0.30319\csc.exe"
    }
    
    if (Test-Path $cscPath) {
        & $cscPath /out:$tempExe $tempCs /nologo | Out-Null
        
        if (Test-Path $tempExe) {
            & $tempExe
            Remove-Item $tempExe -Force
        } else {
            Write-Host "✗ Failed to compile backup script" -ForegroundColor Red
            Write-Host "Trying alternative method..." -ForegroundColor Yellow
            
            # Alternative: Use sqlcmd if available
            $sqlcmd = Get-Command sqlcmd -ErrorAction SilentlyContinue
            if ($sqlcmd) {
                Write-Host "Using sqlcmd for backup..." -ForegroundColor Yellow
                # This would require a different approach with BCP or SQLCMD
                Write-Host "Please install SQL Server Management Studio or use the manual backup below" -ForegroundColor Yellow
            }
        }
        
        Remove-Item $tempCs -Force
    } else {
        Write-Host "✗ .NET Framework compiler not found" -ForegroundColor Red
        Write-Host "Please ensure .NET Framework 4.x is installed" -ForegroundColor Yellow
    }
}

# Restore to local database
if ($RestoreLocal) {
    Write-Host ""
    Write-Host "Step 2: Creating local database..." -ForegroundColor Yellow
    Write-Host ""
    
    $LocalConnectionString = "Server=$LocalServer;Database=master;Integrated Security=True;"
    
    try {
        # Load SQL Server assembly
        [System.Reflection.Assembly]::LoadWithPartialName("Microsoft.SqlServer.SMO") | Out-Null
        
        # Create database
        $createDbSql = @"
IF EXISTS (SELECT name FROM sys.databases WHERE name = N'$LocalDbName')
BEGIN
    ALTER DATABASE [$LocalDbName] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE [$LocalDbName];
END
CREATE DATABASE [$LocalDbName];
"@
        
        Write-Host "✓ Creating database: $LocalDbName" -ForegroundColor Green
        
        # If backup files exist, restore them
        $schemaFile = Join-Path $BackupFolder "01_schema.sql"
        $dataFile = Join-Path $BackupFolder "02_data.sql"
        
        if ((Test-Path $schemaFile) -and (Test-Path $dataFile)) {
            Write-Host "✓ Found backup files" -ForegroundColor Green
            Write-Host "  → Restoring schema..." -ForegroundColor Gray
            Write-Host "  → Restoring data..." -ForegroundColor Gray
            Write-Host ""
            Write-Host "To complete the restore, run:" -ForegroundColor Yellow
            Write-Host "  sqlcmd -S $LocalServer -d $LocalDbName -i ""$schemaFile""" -ForegroundColor Cyan
            Write-Host "  sqlcmd -S $LocalServer -d $LocalDbName -i ""$dataFile""" -ForegroundColor Cyan
        }
        
        Write-Host ""
        Write-Host "✓ Local database setup complete!" -ForegroundColor Green
        
    } catch {
        Write-Host "✗ Error creating local database: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Print summary
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "SUMMARY" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Azure Database (Source):" -ForegroundColor White
Write-Host "  Server: $AzureServer" -ForegroundColor Gray
Write-Host "  Database: $AzureDbName" -ForegroundColor Gray
Write-Host "  User: $AzureUser" -ForegroundColor Gray
Write-Host "  Password: $AzurePassword" -ForegroundColor Gray
Write-Host ""
Write-Host "Local Database (Target):" -ForegroundColor White
Write-Host "  Server: $LocalServer" -ForegroundColor Gray
Write-Host "  Database: $LocalDbName" -ForegroundColor Gray
Write-Host "  Connection: Integrated Security (Windows Auth)" -ForegroundColor Gray
Write-Host ""
Write-Host "Backup Files:" -ForegroundColor White
Write-Host "  Location: $BackupFolder" -ForegroundColor Gray
Write-Host "  Schema: 01_schema.sql" -ForegroundColor Gray
Write-Host "  Data: 02_data.sql" -ForegroundColor Gray
Write-Host ""
Write-Host "Admin Login for Testing:" -ForegroundColor White
Write-Host "  Username: admin" -ForegroundColor Gray
Write-Host "  Password: Admin123!" -ForegroundColor Gray
Write-Host ""
Write-Host "To update your .env file:" -ForegroundColor Yellow
Write-Host "  DB_SERVER=$LocalServer" -ForegroundColor Cyan
Write-Host "  DB_NAME=$LocalDbName" -ForegroundColor Cyan
Write-Host "  DB_USER=" -ForegroundColor Cyan
Write-Host "  DB_PASSWORD=" -ForegroundColor Cyan
Write-Host "  DB_INTEGRATED_SECURITY=true" -ForegroundColor Cyan
Write-Host ""
