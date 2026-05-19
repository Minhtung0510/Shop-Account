BEGIN TRANSACTION;

ALTER TABLE [dbo].[ServiceOrder] DROP CONSTRAINT [ServiceOrder_userId_fkey];

ALTER TABLE [dbo].[ServiceOrder] ADD [userId] NVARCHAR(100) DEFAULT N'';

UPDATE [dbo].[ServiceOrder] SET [userId] = COALESCE((SELECT TOP 1 [id] FROM [dbo].[User] WHERE [role] = 'ADMIN'), N'');

ALTER TABLE [dbo].[ServiceOrder] ALTER COLUMN [userId] NVARCHAR(100) NOT NULL;

ALTER TABLE [dbo].[ServiceOrder] ADD CONSTRAINT [ServiceOrder_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]);

COMMIT;
