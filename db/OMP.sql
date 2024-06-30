drop database OMP;
create database OMP;
use OMP;

create table Users(
	UserId varchar(20),
    Name varchar(20),
    PhoneNo varchar(20) unique not null,
    Gender varchar(10),
    Password varchar(30),
    DOB date,
    Email varchar(100) unique not null,
    primary key(UserId)
);
create table Products(
	ProductId varchar(20),
    Name varchar(20),
    Discription varchar(1000),
    Discount real,
    Price real,
    Stock int,
    SellerType ENUM('User', 'Company'),
	SellerId VARCHAR(20),
    Img1 varchar(200),
    Img2 varchar(200),
    Img3 varchar(200),
    Img4 varchar(200),
    primary key(ProductId)
);


create table Review(
	ReviewId varchar(20),
    UserId varchar(20),
    ProductId varchar(20),
    Comment varchar(1000),
    Rating int check (Rating>-1 and Rating<6),
    primary key(ReviewId),
    foreign key(UserId) references Users(UserId),
    foreign key(ProductId) references Products(ProductId)
);


create table Addresses(
	AddressId varchar(20),
    Country varchar(20),
    State varchar(20),
    City varchar(20),
    PinCode varchar(20),
    AddressLine1 varchar(500),
    AddressLine2 varchar(500),
    UserId varchar(20),
    primary key(AddressId),
    foreign key(UserId)references Users(UserId)
);

create table Orders(
	OrderId varchar(20),
    Date date,
    AddressId varchar(20),
    UserId varchar(20),
    TotalAmount real,
    primary key(OrderId),
    foreign key(AddressId) references Addresses(AddressId),
    foreign key(UserId) references Users(UserId)
);

create table Orders_Products(
	OrderId varchar(20),
    ProductId varchar(20),
	Quantity int,
    primary key(OrderId,ProductId),
    foreign key(OrderId) references Orders(OrderId),
    foreign key(ProductId) references Products(ProductId)
);

create table Catogorys(
    CatogoryId varchar(20),
    CatName varchar(20),
    primary key(CatogoryId)
);

create table Products_Catogorys(
	ProductId varchar(20),
    CatogoryId varchar(20),
    primary key(ProductId,CatogoryId),
    foreign key(ProductId) references Products(ProductId),
    foreign key(CatogoryId) references Catogorys(CatogoryId)
);

create table Wishlist(
	UserId varchar(20),
	ProductId varchar(20),
    foreign key(UserId) references Users(UserId),
    foreign key(ProductId) references Products(ProductId),
    primary key(UserId,ProductId)
);

create table Payment(
	PaymentID varchar(20),
	OrderID varchar(20),
	PaymentMethod varchar(10),
    check (PaymentMethod in ('Online','Onsite')),
	PaymentStatus boolean,
    primary key(PaymentId),
    foreign key (OrderId) references Orders(OrderId)
);

select * from Users;
select * from Companies;
select * from Products;
select * from Wishlist;
select * from Addresses;
select * from Review;
select * from Orders;
select * from Orders_Products;
select * from Catogorys;
select * from Products_Catogorys;

select * from Orders where UserId='Sp7Fy9a84MhuF1RrcwfH';



SELECT  SUM(op.Quantity) AS quantity
FROM Orders o
INNER JOIN Orders_Products op ON o.OrderId = op.OrderId
WHERE YEAR(o.Date) = 2024
  AND op.ProductId = 'Wpqj4EwiJGDi5OjpRQTn'
GROUP BY MONTH(o.Date)
ORDER BY MONTH(o.Date);



SELECT YEAR(o.Date) AS Year, MONTH(o.Date) AS Month,
  COALESCE(SUM(op.Quantity), 0) AS quantity
FROM Orders o
INNER JOIN Orders_Products op ON o.OrderId = op.OrderId
WHERE YEAR(o.Date) = YEAR(CURDATE())  -- Using CURDATE() for current year
  AND op.ProductId = 'Wpqj4EwiJGDi5OjpRQTn'
GROUP BY YEAR(o.Date), MONTH(o.Date)
ORDER BY YEAR(o.Date), MONTH(o.Date);