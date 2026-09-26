-- OPTIONAL: Azure SQL schema for Anki ETL (alternative to Azure Table Storage).
-- The console tool tools/AnkiSqlEtl now targets Table Storage by default.
-- Use this script only if you prefer SQL Server instead.
--
-- Example:
--   sqlcmd -S tcp:YOUR.database.windows.net,1433 -d DemoEnglish -U etl_user -P "***" -i sql/anki-azure-sql.sql

SET NOCOUNT ON;
GO

IF OBJECT_ID(N'dbo.AnkiNoteMedia', N'U') IS NOT NULL DROP TABLE dbo.AnkiNoteMedia;
IF OBJECT_ID(N'dbo.AnkiNote', N'U') IS NOT NULL DROP TABLE dbo.AnkiNote;
IF OBJECT_ID(N'dbo.AnkiImport', N'U') IS NOT NULL DROP TABLE dbo.AnkiImport;
GO

CREATE TABLE dbo.AnkiImport
(
    ImportId       BIGINT         NOT NULL IDENTITY(1, 1)
        CONSTRAINT PK_AnkiImport PRIMARY KEY,
    SourceFileName NVARCHAR(512)  NOT NULL,
    SourceSha256   CHAR(64)       NULL,
    DeckName       NVARCHAR(256)  NOT NULL,
    ImportedAtUtc  DATETIME2(3)   NOT NULL
        CONSTRAINT DF_AnkiImport_ImportedAtUtc DEFAULT (SYSUTCDATETIME()),
    NoteCount      INT            NOT NULL
        CONSTRAINT DF_AnkiImport_NoteCount DEFAULT (0),
    Warnings       NVARCHAR(MAX)  NULL
);
GO

CREATE TABLE dbo.AnkiNote
(
    NoteId     BIGINT        NOT NULL IDENTITY(1, 1)
        CONSTRAINT PK_AnkiNote PRIMARY KEY,
    ImportId   BIGINT        NOT NULL,
    AnkiNoteId BIGINT        NULL,           -- original notes.id from collection.anki2
    Ordinal    INT           NOT NULL,       -- 1-based order within this import
    Front      NVARCHAR(MAX) NOT NULL,
    Back       NVARCHAR(MAX) NOT NULL,
    FrontPlain NVARCHAR(400) NULL,           -- first line / search helper (no media tags)
    CONSTRAINT FK_AnkiNote_Import
        FOREIGN KEY (ImportId) REFERENCES dbo.AnkiImport (ImportId) ON DELETE CASCADE
);
GO

CREATE INDEX IX_AnkiNote_ImportId ON dbo.AnkiNote (ImportId);
CREATE INDEX IX_AnkiNote_AnkiNoteId ON dbo.AnkiNote (AnkiNoteId) WHERE AnkiNoteId IS NOT NULL;
CREATE INDEX IX_AnkiNote_FrontPlain ON dbo.AnkiNote (FrontPlain);
GO

CREATE TABLE dbo.AnkiNoteMedia
(
    NoteMediaId BIGINT         NOT NULL IDENTITY(1, 1)
        CONSTRAINT PK_AnkiNoteMedia PRIMARY KEY,
    NoteId      BIGINT         NOT NULL,
    Kind        VARCHAR(8)     NOT NULL,     -- 'sound' | 'img'
    FileName    NVARCHAR(512)  NOT NULL,     -- logical name inside the .apkg media map
    SortOrder   INT            NOT NULL,
    CONSTRAINT FK_AnkiNoteMedia_Note
        FOREIGN KEY (NoteId) REFERENCES dbo.AnkiNote (NoteId) ON DELETE CASCADE,
    CONSTRAINT CK_AnkiNoteMedia_Kind CHECK (Kind IN ('sound', 'img'))
);
GO

CREATE INDEX IX_AnkiNoteMedia_NoteId ON dbo.AnkiNoteMedia (NoteId);
CREATE INDEX IX_AnkiNoteMedia_FileName ON dbo.AnkiNoteMedia (FileName);
GO

-- Optional: latest import per deck name (helper view)
CREATE OR ALTER VIEW dbo.vw_AnkiLatestImport
AS
    SELECT i.*
    FROM dbo.AnkiImport AS i
    INNER JOIN (
        SELECT DeckName, MAX(ImportId) AS MaxImportId
        FROM dbo.AnkiImport
        GROUP BY DeckName
    ) AS x ON x.MaxImportId = i.ImportId;
GO
