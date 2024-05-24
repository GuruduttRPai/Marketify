import express, { json } from 'express';
import { getUsers, getUserFormUserId, createUser,getSellers, getSellerFormSellId, createSeller, getColors,getCatogorys, sellProduct,getProduct,getAllProduct, createAddress, getAddressFromUserId,createOrder,addProductToOrder,getAllOrders, getAllProductOfOrder } from '../db/database.js';
import uniqueIdGenerator from '@olaf-wilkosz/unique-id-generator';
import bodyParser from 'body-parser';
import multer from 'multer';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import morgan from 'morgan';
dotenv.config();

var uplodes = multer({dest: "\IMG_TEMP"})

const createFolderIfNotExists = (folderPath) => {
    // Check if the folder exists
    if (!fs.existsSync(folderPath)) {
        // If it doesn't exist, create the folder
        fs.mkdirSync(folderPath);
        console.log(`Folder created at ${folderPath}`);
    } else {
        console.log(`Folder already exists at ${folderPath}`);
    }
};

const app = express();

app.use(express.static('./public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(morgan('tiny'));
app.get('/signup',(req,res)=>{
    res.render('signup.ejs');
})

app.get('/login',(req,res)=>{
    res.render('login.ejs');
})
app.get('/cAddress',(req,res)=>{
    res.render('createAddress.ejs');
})
app.get('/allAddress',(req,res)=>{
    res.render('allAddress.ejs');
})
app.get('/getOrders',(req,res)=>{
    res.render('getOrders.ejs');
})
app.get('/signupAsSeller',(req,res)=>{
    res.render('signupAsSeller.ejs');
})
app.get('/sell',(req,res)=>{
    res.render('sell.ejs');
})
app.get('/seeProduct',(req,res)=>{
    res.render('viewProduct.ejs');
})
app.get('/allProducts',(req,res)=>{
    res.render('home.ejs');
})
app.get('/addProduct',(req,res)=>{
    res.render('ProToOrd.ejs')
})
app.get('/getporInOrd',(req,res)=>{
    res.render('ProInOrd.ejs');
})
//User related api ********************************************************************************************************
app.post('/login', async (req, res) => {
    console.log(req.body);
    res.status(200).send('ok')
});
app.get('/getUsers', async (req, res) => {
    const ans = await getUsers();
    res.send(ans);
});
app.get('/getUserFormUserId/:UserId', async (req, res) => {
    const UserId = req.params.UserId;
    const ans = await getUserFormUserId(UserId);
    res.send(ans);
});
app.post('/createUser', async (req, res) => {
    const UserId = uniqueIdGenerator(20);
    try {
        console.log(UserId, req.body.Name, req.body.PhoneNo, req.body.Gender, req.body.Password, req.body.DOB, req.body.Email);
        const ans = await createUser(UserId, req.body.Name, req.body.PhoneNo, req.body.Gender, req.body.Password, req.body.DOB, req.body.Email);
        res.status(200).send(ans);
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).send('Internal Server Error');
    }
});
//Seller related api ********************************************************************************************************
app.get('/getSellers', async (req, res) => {
    const ans = await getSellers();
    res.send(ans);
});
app.get('/getSellerFormSellId/:SellId', async (req, res) => {
    const SellId = req.params.SellId;
    const ans = await getSellerFormSellId(SellId);
    res.send(ans);
});
app.post('/createSeller', async (req, res) => {
    const SellId = uniqueIdGenerator(20);
    const { Name, PhoneNo, Gender, Password, DOB, Email } = req.body; 
    try {
        const ans = await createSeller(SellId, Name, PhoneNo, Gender, Password, DOB, Email);
        console.log(ans);
        res.status(200).send(ans);
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).send('Internal Server Error');
    }
});
app.get('/getColors', async (req, res) => {
    const ans = await getColors();
    res.send(ans);
});
app.get('/getCatogorys', async (req, res) => {
    const ans = await getCatogorys();
    res.send(ans);
});
//Products ********************************************************************************************************
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "C:\\Users\\Dell\\Desktop\\DBMS project\\PRO_IMG");
    },
    filename: function (req, file, cb) {
        cb(null, uniqueIdGenerator(30) + '.png');
    }
});
const upload = multer({ storage: storage });
app.get('/getAllProduct', async (req, res) => {
    try {
        const result = await getAllProduct();
        console.log(result[0]);
        res.send(result[0]);
    } catch (error) {
        console.error('Error fetching all products:', error);
        res.status(500).send('Internal Server Error');
    }
});
app.post('/sellProduct', upload.array('files'), async (req, res) => {
    try {
        // Handle file upload errors
        if (req.fileValidationError) {
            return res.status(400).json({ error: req.fileValidationError });
        } else if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No files were uploaded' });
        }

        // Extract filenames of uploaded files
        const filenames = req.files.map(file => file.filename);
        let Img1, Img2, Img3, Img4;
        if (filenames.length >= 1) Img1 = filenames[0];
        if (filenames.length >= 2) Img2 = filenames[1];
        if (filenames.length >= 3) Img3 = filenames[2];
        if (filenames.length >= 4) Img4 = filenames[3];

        // Generate unique product ID
        const ProId = uniqueIdGenerator(20);
        
        // Extract product details from request body
        const { SellerId, Description, Discount, Price, pt, color } = req.body;

        // Sell the product
        const result = await sellProduct(ProId, SellerId, Description, Discount, Price, Img1, Img2, Img3, Img4, pt, color);

        // Send success response
        res.status(200).json(result);
    } catch (error) {
        console.error('Error selling product:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
app.get('/getProductDetail/:ProId', async (req, res) => {
    const ProId = req.params.ProId;
    const result = await getProduct(ProId);

    console.log(result);
    res.send(result[0]);

});
app.get('/getProductImg/:ProId', async (req, res) => {
    const ProId = req.params.ProId;
    try {
        const result = await getProduct(ProId); // Assuming getProduct function retrieves product details including image filenames
        const { Img1, Img2, Img3, Img4 } = result[0];

        const imgDir = "C:\\Users\\Dell\\Desktop\\DBMS project\\PRO_IMG"; // Provide the directory path containing your images
        const imgPaths = [Img1, Img2, Img3, Img4].filter(img => img); // Filter out undefined or empty image paths

        // Send the images as an array of base64 strings
        const images = [];
        for (const imgPath of imgPaths) {
            const imgPathFull = path.join(imgDir, imgPath);
            const imgData = fs.readFileSync(imgPathFull);
            const imgBase64 = imgData.toString('base64');
            images.push(`data:image/png;base64,${imgBase64}`);
        }
        res.status(200).json(images);
    } catch (err) {
        console.error('Error fetching product images:', err);
        res.status(500).send('Internal Server Error');
    }
});
app.post('/createAddress', async (req, res) => {
    const AdsId = uniqueIdGenerator(20);
    const { Country, State, District, Street, HouseNo, Pincode, UserId } = req.body;
    try {
        console.log(req.body);
        const ans = await createAddress(AdsId, Country, State, District, Street, HouseNo, Pincode, UserId);
        res.status(200).send(ans);
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).send('Internal Server Error');
    }
});
app.post('/getAddressFromUserId', async (req, res) => {
    const { UserId } = req.body;
    try {
        const ans = await getAddressFromUserId(UserId);
        console.log(ans[0]); // Log the addresses retrieved from the database
        res.status(200).send(ans[0]);
    } catch (error) {
        console.error('Error fetching user addresses:', error);
        res.status(500).send('Internal Server Error');
    }
});
app.post('/createOrder',async (req,res)=>{
    const OrdId = uniqueIdGenerator(20);
    const date = new Date();
    const {AdsId,UserId}= req.body;
    const result = await createOrder(OrdId,date,AdsId,UserId);
    console.log(result);
    res.send(result);
});
app.post('/getAllProductInOrder', async (req, res) => {
    try {
        const { OrdId } = req.body;
        console.log(OrdId);
        const result = await getAllProductOfOrder(OrdId);
        console.log(result[0]);
        res.status(200).json(result[0]); // Send the orders data as JSON response
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).send('Internal Server Error');
    }
});
app.post('/getAllOrder', async (req, res) => {
    try {
        const { UserId } = req.body;
        console.log(UserId);
        const result = await getAllOrders(UserId);
        console.log(result[0]);
        res.status(200).json(result[0]); // Send the orders data as JSON response
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).send('Internal Server Error');
    }
});
app.post('/addProductToOrder', async (req, res) => {
    try {
        const { OrdId, ProId } = req.body;
        console.log(OrdId+' '+ProId);
        const result = await addProductToOrder(OrdId, ProId);
        console.log("hihihi  "+result);
        res.status(200).json({ success: true, message: 'Product added to order successfully' });
    } catch (error) {
        console.error('Error adding product to order:', error.message);
        res.status(500).json({ success: false, message: 'Failed to add product to order. Please try again later.' });
    }
});
app.listen(3000,()=>{
    console.log("no 3000")

});
export default app;