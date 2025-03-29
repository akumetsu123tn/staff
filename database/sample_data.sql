USE LightningDegreeDB;
GO

-- Insert sample users
INSERT INTO Users (Username, Email, PasswordHash, Credits, RoleID, CreatedAt)
VALUES 
('admin', 'admin@example.com', 'hashed_admin_password', 1000, 1, GETDATE()), -- Admin user
('manager1', 'manager@example.com', 'hashed_manager_password', 500, 2, GETDATE()), -- Manager
('artist1', 'artist@example.com', 'hashed_artist_password', 300, 3, GETDATE()), -- Artist
('john_doe', 'john@example.com', 'hashed_password_1', 100, 4, GETDATE()),
('jane_smith', 'jane@example.com', 'hashed_password_2', 50, 4, GETDATE()),
('mike_wilson', 'mike@example.com', 'hashed_password_3', 75, 4, GETDATE());

-- Insert sample tags
INSERT INTO Tags (Name)
VALUES 
('Action'),
('Romance'),
('Fantasy'),
('Comedy'),
('Drama'),
('Sci-Fi');

-- Insert sample manga
INSERT INTO Manga (Title, Description, CoverImageURL, Status, Rating, TotalViews)
VALUES 
('The Dragon''s Legacy', 'A fantasy tale about a young dragon rider who must save their kingdom.', 'https://example.com/covers/dragon-legacy.jpg', 'Ongoing', 4.5, 10000),
('Love in Tokyo', 'A romantic comedy about two students who meet in Tokyo.', 'https://example.com/covers/love-tokyo.jpg', 'Completed', 4.2, 8000),
('Cyber Knights', 'In a futuristic world, cyber-enhanced warriors fight for justice.', 'https://example.com/covers/cyber-knights.jpg', 'Ongoing', 4.7, 15000);

-- Link manga with tags
INSERT INTO MangaTags (MangaID, TagID)
VALUES 
(1, 1), -- Dragon's Legacy - Action
(1, 3), -- Dragon's Legacy - Fantasy
(2, 2), -- Love in Tokyo - Romance
(2, 4), -- Love in Tokyo - Comedy
(3, 1), -- Cyber Knights - Action
(3, 6); -- Cyber Knights - Sci-Fi

-- Insert sample chapters
INSERT INTO Chapters (MangaID, ChapterNumber, Title, UploadDate, Views)
VALUES 
(1, 1.0, 'The Beginning', GETDATE(), 1000),
(1, 1.1, 'First Flight', GETDATE(), 800),
(2, 1.0, 'Tokyo Arrival', GETDATE(), 1200),
(2, 1.1, 'First Meeting', GETDATE(), 900),
(3, 1.0, 'Cyber Awakening', GETDATE(), 1500);

-- Insert sample chapter images
INSERT INTO ChapterImages (ChapterID, ImageURL, ImageOrder)
VALUES 
(1, 'https://example.com/chapters/dragon-legacy/ch1/p1.jpg', 1),
(1, 'https://example.com/chapters/dragon-legacy/ch1/p2.jpg', 2),
(2, 'https://example.com/chapters/dragon-legacy/ch1.1/p1.jpg', 1),
(3, 'https://example.com/chapters/love-tokyo/ch1/p1.jpg', 1),
(4, 'https://example.com/chapters/love-tokyo/ch1.1/p1.jpg', 1),
(5, 'https://example.com/chapters/cyber-knights/ch1/p1.jpg', 1);

-- Insert sample comments
INSERT INTO Comments (UserID, ChapterID, Content)
VALUES 
(1, 1, 'Great first chapter!'),
(2, 1, 'The art style is amazing!'),
(3, 3, 'Can''t wait for the next chapter!');

-- Insert sample user favorites
INSERT INTO UserFavorites (UserID, MangaID)
VALUES 
(1, 1),
(1, 3),
(2, 2),
(3, 1);

-- Insert sample read history
INSERT INTO UserReadHistory (UserID, ChapterID)
VALUES 
(1, 1),
(1, 2),
(2, 3),
(3, 1);

-- Insert sample transactions
INSERT INTO Transactions (UserID, Amount, Type, Description)
VALUES 
(1, 50, 'Purchase', 'Purchased premium credits'),
(2, 25, 'Reward', 'Daily login reward'),
(3, 100, 'Purchase', 'Bulk credit purchase'); 