import mysql from 'mysql2';
import dotenv from 'dotenv';
//import { reset } from 'nodemon';
dotenv.config();

const pool = mysql.createPool({
    host:process.env.SQL_HOST,
    user:process.env.SQL_USER,
    password:process.env.SQL_PASSWORD,
    database:process.env.SQL_DATABASE
}).promise()

//User related functons
export async function getUsers(){
    dotenv.config();
    const result = await pool.query('select * from Users');
    return result[0];
};

export async function getUserFormId(UserId){
    dotenv.config();
    const result = await pool.query(`
        select * 
        from Users 
        where UserId=?`,[UserId]);
    return result[0];
};

export async function createUser(UserId,Name,PhoneNo,Gender,Password,DOB,Email){
    dotenv.config();
    const result = await pool.query(`insert into Users values(?,?,?,?,?,?,?)`,[UserId,Name,PhoneNo,Gender,Password,DOB,Email]);
    return {UserId:UserId,Name:Name,PhoneNo:PhoneNo,Gender:Gender,Password:Password,DOB:DOB,Email:Email};
};

export async function updateUser(UserId,Name,PhoneNo,Gender,DOB,Email){
    dotenv.config();
    const result = await pool.query(`UPDATE Users SET Name = ?, PhoneNo = ?, Gender = ?, DOB = ?, Email = ? WHERE UserId =?`,[Name,PhoneNo,Gender,DOB,Email,UserId]);
    return {UserId:UserId,Name:Name,PhoneNo:PhoneNo,Gender:Gender,DOB:DOB,Email:Email};
}

export async function getCatogorys(){
    dotenv.config();
    const result = await pool.query('select CatName from Catogorys');
    return result[0];
};

export async function sellProduct(ProductId,Name, Description, Discount, Price, Stock,  SellerType, SellerId, Img1, Img2, Img3, Img4) {
    // Insert product details into Products table
    await pool.query(`INSERT INTO Products VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [ProductId,Name, Description, Discount, Price, Stock,  SellerType, SellerId, Img1, Img2, Img3, Img4]);
    return {ProductId:ProductId,Name:Name, Description:Description, Discount:Discount, Price:Price, Stock:Stock,  SellerType:SellerType, SellerId:SellerId, Img1:Img1, Img2:Img2, Img3:Img3, Img4:Img4}
};

export async function getProduct(ProductId){
    dotenv.config();
    const result = await pool.query(`select * from Products where ProductId=?`,[ProductId]);
    return result[0];
};

export async function getAllProducts() {
    try {
        const result = await pool.query(`SELECT ProductId,Name, Discription, Discount, Price, Stock,  SellerType, SellerId FROM Products;`);
        return result[0];
    } catch (error) {
        console.error('Error fetching all products:', error);
        throw error;
    };
};

export async function createAddress(AddressId, Country, State, City, PinCode, AddressLine1, AddressLine2, UserId) {
    const result = await pool.query('INSERT INTO Addresses VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [AddressId, Country, State, City, PinCode, AddressLine1, AddressLine2, UserId]);
    return result;
}

export async function getAddressFromUserId(UserId){
    const result = await pool.query('select * from Addresses where UserId=?',[UserId]);
    return result[0];
}

export async function createOrder(OrdId,Date,AdsId,UserId,TotalAmount){
    const result = await pool.query(`insert into Orders values(?,?,?,?,?);`,[OrdId,Date,AdsId,UserId,TotalAmount]);
    return result[0];
}

export async function getOrdersByUser(UserId){
    const result = await pool.query(`select * from Orders where UserId=?`,[UserId]);
    return result[0];
}


export async function addProductToOrder(OrderId,ProductId,Quantity){
    const result = await pool.query('insert into Orders_Products values(?,?,?)',[OrderId,ProductId,Quantity]);
    return result;
}


export async function getProductInsites(ProductId,year){
    const result = await pool.query(`
            SELECT YEAR(o.Date) AS Year, MONTH(o.Date) AS Month,
            COALESCE(SUM(op.Quantity), 0) AS quantity
            FROM Orders o
            INNER JOIN Orders_Products op ON o.OrderId = op.OrderId
            WHERE YEAR(o.Date) = ?
                AND op.ProductId = ?
            GROUP BY MONTH(o.Date)
            ORDER BY MONTH(o.Date);       
        `,[year,ProductId]);
    return result[0];
}

export async function getAllProductOfOrder(OrdId){
    const result = await pool.query(`
        select op.Quantity as quantity, p.Name as productName
        from Orders_Products op
        join Products p ON p.ProductId=op.ProductId
        where op.OrderId=?`,[OrdId]);
    return result[0];
}

export async function getProductsOfSeller(UserId){
    const result = await pool.query('select * from Products where SellerId=?',[UserId]);
    return result[0];
}

export async function getPNamesOfOrder(OrdId){
    const result = await pool.query('select Name from Products where ProductId in (select ProductId  from Orders_Products where OrdId=?)',[OrdId]);
    return result;
}

export async function addProductToWishList(UserId,ProductId){
    const result = await pool.query('insert into Wishlist values(?,?)',[UserId,ProductId]);
    return result;
}

export async function getWishList(UserId){
    const result = await pool.query(
        `SELECT p.*
        FROM Products p
        JOIN Wishlist w ON p.ProductId = w.ProductId
        WHERE w.UserId = ?`
         ,[UserId]);
    return result[0];
}


export async function addReview(ReviewId,UserId,ProductId,Comment,Ratting){
    const result = await pool.query('insert into Review values(?,?,?,?,?)',[ReviewId,UserId,ProductId,Comment,parseInt(Ratting)]);
    return result;
}

export async function getReview(ProductId){
    const result = await pool.query('select Comment from Review where ProductId = ?',[ProductId]);
    return result;
}

export async function removeFromWishList(ProductId){
    const result = await pool.query('delete from Wishlist where ProductId = ?',[ProductId]);
    return result;
}

export async function getAllCatagorys(){
    const result = await pool.query('select * from Catogorys');
    return result[0];
}

export async function getProductsByCatagory(catagoryId){
    const result = await pool.query(`
        select ProductId,Name, Discription, Discount, Price, Stock,  SellerType, SellerId 
        from Products 
        where ProductId in (
            select  ProductId 
            from Products_Catogorys 
            where CatogoryId = ?
        )
        `,[catagoryId]);
    return result[0];
}



export async function PutEmailAuth(Email, pass) {
    try {
      const isIn = await pool.query('SELECT * FROM Email_auth WHERE Email = ?;', [Email]);
  
      if (isIn[0].length > 0) {
        const updateResult = await pool.query('UPDATE Email_auth SET Pass = ? WHERE Email = ?;', [pass, Email]);
        return updateResult[0];
      } else {
        const insertResult = await pool.query('INSERT INTO Email_auth VALUES (?,?,?);', [Email, pass, false]);
        return insertResult[0];
      }
    } catch (error) {
      console.error('Error in PutEmailAuth:', error);
      throw error; // Re-throw the error for further handling
    }
  }


export async function GetEmailAuth(Email){
    try {
        let auth = await pool.query('SELECT * FROM Email_auth WHERE Email = ?;', [Email]);

        if (auth[0].length > 0) {
            return auth;
        }
        else{
            return {message:'not found'}
        }
    } catch (error) {
        console.error(error);
        return { message: 'Error occurred', error };
    }
}



export async function setEmailVerified(Email) {
    const updateResult = await pool.query('UPDATE Email_auth SET verified = ? WHERE Email = ?;', [true, Email]);
    return updateResult[0];
}




export async function PutPhoneAuth(PhoneNo, pass) {
    try {
        let isIn = await pool.query('SELECT * FROM Phone_auth WHERE PhoneNo = ?;', [PhoneNo]);

        if (isIn[0].length > 0) {
            
            const updateResult = await pool.query('UPDATE Phone_auth SET Pass = ? WHERE PhoneNo = ?;', [pass, PhoneNo]);
            return updateResult[0];
        } else {
            
            const insertResult = await pool.query('INSERT INTO Phone_auth (PhoneNo, Pass) VALUES (?,?,?);', [PhoneNo, pass, false]);
            return insertResult[0];
        }
    } catch (error) {
        console.error(error);
        return { message: 'Error occurred', error };
    }
}

export async function GetPhoneAuth(PhoneNo){
    try {
        let auth = await pool.query('SELECT * FROM Phone_auth WHERE PhoneNo = ?;', [PhoneNo]);
        if (auth[0].length > 0) {
            return auth;
        }
        else{
            return {message:'not found'}
        }
    } catch (error) {
        console.error(error);
        return { message: 'Error occurred', error };
    }
}


export async function setPhoneNoVerified(PhoneNo) {
    const updateResult = await pool.query('UPDATE Phone_auth SET verified = ? WHERE PhoneNo = ?;', [true, PhoneNo]);
    return updateResult[0];
}