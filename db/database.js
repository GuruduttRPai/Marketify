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

export async function getUserFormUserId(UserId){
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

//Company relates functions

export async function getSellers(){
    dotenv.config();
    const result = await pool.query('select * from Sellers');
    return result[0];
};

export async function getSellerFormSellId(SellId){
    dotenv.config();
    const result = await pool.query(`
        select * 
        from Sellers
        where SellId=?`,[SellId]);
    return result[0];
};

export async function createSeller(SellId,Name,PhoneNo,Gender,Password,DOB,Email){
    dotenv.config();
    const result = await pool.query(`insert into Sellers values(?,?,?,?,?,?,?)`,[SellId,Name,PhoneNo,Gender,Password,DOB,Email]);
    return {SellId:SellId,Name:Name,PhoneNo:PhoneNo,Gender:Gender,Password:Password,DOB:DOB,Email:Email};
};

export async function getColors(){
    dotenv.config();
    const result = await pool.query('select * from Colors');
    return result[0];
};

export async function getCatogorys(){
    dotenv.config();
    const result = await pool.query('select * from Catogorys');
    return result[0];
};

export async function sellProduct(ProId, SellerId, Description, Discount, Price, Img1, Img2, Img3, Img4, pt, color) {
    try {
        // Insert product details into Products table
        await pool.query(`INSERT INTO Products VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [ProId, SellerId, Description, Discount, Price, Img1, Img2, Img3, Img4]);

        // Insert product category (color) into Products_Catogorys table
        await pool.query(`INSERT INTO Products_Catogorys VALUES (?, 'Color', ?)`, [ProId, color]);

        // Insert product category (product type) into Products_Catogorys table
        await pool.query(`INSERT INTO Products_Catogorys VALUES (?, 'ProductType', ?)`, [ProId, pt]);

        // Return success message or handle additional logic if needed
        return { message: 'Product sold successfully' };
    } catch (error) {
        console.error('Error selling product:', error);
        throw new Error('Failed to sell product');
    }
}


export async function setProductCatogorys(ProId,CatName,CatVal){
    const result = await pool.query(`insert into Products_Catogorys values(?,?,?)`,[ProId,CatName,CatVal]);
    return result[0];
};

export async function getProduct(ProId){
    dotenv.config();
    const result = await pool.query(`select * from Products p where p.ProId=?`,[ProId]);
    return result[0];
};

export async function getAllProduct() {
    try {
        const result = await pool.query(`SELECT ProId, SellID, Discription, Discount, Price FROM Products;`);
        //console.log(result);

        // Return the result directly
        return result;
    } catch (error) {
        // Handle errors, such as database connection issues
        console.error('Error fetching all products:', error);
        throw error; // Re-throw the error for the caller to handle
    }
}
export async function getBtProductCatogorys(CatName,CatVal){
    const result = await pool.query(`
    select p.ProId
    from Products p,Products_Catogorys pc
     where p.ProId=pc.ProId  and pc.CatVal= ? and pc.CatName= ? `,[ProId]);
    return result[0];
};

export async function createAddress(AdsId, Country, State, District, Street, HouseNo, pincode, UserId) {
    const result = await pool.query('INSERT INTO Addresses (AdsId, Country, State, District, Street, HouseNo, pincode, UserId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [AdsId, Country, State, District, Street, HouseNo, pincode, UserId]);
    return result;
}

export async function getAddressFromUserId(UserId){
    const result = await pool.query('select * from Addresses where UserId=?',[UserId]);
    return result;
}

export async function createOrder(OrdId,Date,AdsId,UserId){
    const result = await pool.query(`insert into Orders values(?,?,?,?);`,[OrdId,Date,AdsId,UserId]);
    return result;
}

export async function getAllOrders(UserId){
    //console.log(UserId);
    const result = await pool.query('select * from Orders where UserId=?',[UserId]);
    console.log(result);
    return result;
}


export async function addProductToOrder(OrdId,ProId){
    const result = await pool.query('insert into Orders_Products values(?,?)',[OrdId,ProId]);
    return result;
}


export async function getAllProductOfOrder(OrdId){
    const result = await pool.query('select * from Orders_Products where OrdId=?',[OrdId]);
    return result;
}