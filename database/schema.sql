-- Create the database
CREATE DATABASE LightningDegreeDB;
GO

USE LightningDegreeDB;
GO

-- Create Users table
CREATE TABLE Users (
    UserID INT IDENTITY(1,1) PRIMARY KEY,
    Username NVARCHAR(50) NOT NULL UNIQUE,
    Email NVARCHAR(100) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(256) NOT NULL,
    Credits INT DEFAULT 0,
    CreatedAt DATETIME DEFAULT GETDATE(),
    LastLogin DATETIME
);

-- Create Manga table
CREATE TABLE Manga (
    MangaID INT IDENTITY(1,1) PRIMARY KEY,
    Title NVARCHAR(200) NOT NULL,
    Description NVARCHAR(MAX),
    CoverImageURL NVARCHAR(500),
    Status NVARCHAR(20) DEFAULT 'Ongoing',
    Rating DECIMAL(3,2) DEFAULT 0,
    TotalViews INT DEFAULT 0,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE()
);

-- Create Chapters table
CREATE TABLE Chapters (
    ChapterID INT IDENTITY(1,1) PRIMARY KEY,
    MangaID INT FOREIGN KEY REFERENCES Manga(MangaID),
    ChapterNumber DECIMAL(10,2) NOT NULL,
    Title NVARCHAR(200),
    UploadDate DATETIME DEFAULT GETDATE(),
    Views INT DEFAULT 0,
    UNIQUE(MangaID, ChapterNumber)
);

-- Create ChapterImages table
CREATE TABLE ChapterImages (
    ImageID INT IDENTITY(1,1) PRIMARY KEY,
    ChapterID INT FOREIGN KEY REFERENCES Chapters(ChapterID),
    ImageURL NVARCHAR(500) NOT NULL,
    ImageOrder INT NOT NULL
);

-- Create UserFavorites table
CREATE TABLE UserFavorites (
    UserID INT FOREIGN KEY REFERENCES Users(UserID),
    MangaID INT FOREIGN KEY REFERENCES Manga(MangaID),
    AddedAt DATETIME DEFAULT GETDATE(),
    PRIMARY KEY (UserID, MangaID)
);

-- Create UserReadHistory table
CREATE TABLE UserReadHistory (
    UserID INT FOREIGN KEY REFERENCES Users(UserID),
    ChapterID INT FOREIGN KEY REFERENCES Chapters(ChapterID),
    LastReadAt DATETIME DEFAULT GETDATE(),
    PRIMARY KEY (UserID, ChapterID)
);

-- Create Comments table
CREATE TABLE Comments (
    CommentID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT FOREIGN KEY REFERENCES Users(UserID),
    ChapterID INT FOREIGN KEY REFERENCES Chapters(ChapterID),
    Content NVARCHAR(MAX) NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- Create Tags table
CREATE TABLE Tags (
    TagID INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(50) NOT NULL UNIQUE
);

-- Create MangaTags table (Many-to-Many relationship)
CREATE TABLE MangaTags (
    MangaID INT FOREIGN KEY REFERENCES Manga(MangaID),
    TagID INT FOREIGN KEY REFERENCES Tags(TagID),
    PRIMARY KEY (MangaID, TagID)
);

-- Create Transactions table
CREATE TABLE Transactions (
    TransactionID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT FOREIGN KEY REFERENCES Users(UserID),
    Amount INT NOT NULL,
    Type NVARCHAR(20) NOT NULL, -- 'Purchase', 'Reward', etc.
    Description NVARCHAR(200),
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- Create indexes for better performance
CREATE INDEX IX_Manga_Title ON Manga(Title);
CREATE INDEX IX_Chapters_MangaID ON Chapters(MangaID);
CREATE INDEX IX_ChapterImages_ChapterID ON ChapterImages(ChapterID);
CREATE INDEX IX_UserFavorites_UserID ON UserFavorites(UserID);
CREATE INDEX IX_UserReadHistory_UserID ON UserReadHistory(UserID);
CREATE INDEX IX_Comments_ChapterID ON Comments(ChapterID); 