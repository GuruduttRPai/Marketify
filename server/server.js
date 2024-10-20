import express, { json } from 'express';
import { getUsers, getUserFormId, updateUser, createUser, getAllProducts,getProduct,sellProduct,addProductToWishList,createAddress,getWishList,getAddressFromUserId,addReview,getReview,createOrder,addProductToOrder,removeFromWishList,getAllCatagorys,getProductsByCatagory,getOrdersByUser,getProductsOfSeller,getProductInsites,getAllProductOfOrder, GetEmailAuth, PutEmailAuth, GetPhoneAuth, PutPhoneAuth, setEmailVerified, setPhoneNoVerified} from '../db/database.js';
import uniqueIdGenerator from '@olaf-wilkosz/unique-id-generator';
import bodyParser from 'body-parser';
import multer from 'multer';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import morgan from 'morgan';
import nodemailer from 'nodemailer';
import Chart from 'chart.js/auto';
import { Console } from 'console';
import twilio  from 'twilio';
import { randomInt } from 'crypto';
dotenv.config();


const catchAsyncErrors = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
  



const createFolderIfNotExists = (folderPath) => {

    if (!fs.existsSync(folderPath)) {

        fs.mkdirSync(folderPath);
        console.log(`Folder created at ${folderPath}`);
    } else {
        res.status(500).render('errorOut.ejs');
    }
};

const app = express();

app.use(express.static('./public'));
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(bodyParser.urlencoded({extended:true}));
app.use(morgan('tiny'));
app.use(express.json());

app.get('/',(req,res)=>{
    res.redirect('/login');
})

app.post('/signup', (req, res) => {
    console.log(req.body);
    let email=req.body.email;
    let phoneNo=req.body.phoneNo;
    res.render('signup.ejs', { email, phoneNo});
  });

app.get('/login',(req,res)=>{
    res.render('login.ejs');
})
app.post('/createNewAddress',(req,res)=>{
    res.render('createAddress.ejs',{'UserId':req.body.UserId});
})
app.post('/sell',(req,res)=>{
    res.render('sell.ejs',{SellerType:req.params.SellerType});
});

app.post('/createOrder',async(req,res)=>{
    const addresses = await getAddresses(req.body.UserId)
    const products =await getWishList(req.body.UserId);
    res.render('order.ejs',{'UserId':req.body.UserId,'Addresses':addresses,'products':products});
});
//User related api ********************************************************************************************************
async function renderProfile(UserId){
    const user = await getUserFormId(UserId);
    const orders = await getOrdersByUser(UserId);
    const productCatagory = await getAllCatagorys();
    const productsSoled = await getProductsOfSeller(UserId);
    let orderDetails={}
    let productInsites={}

    for(let order of orders){
        orderDetails[order.OrderId]= await getAllProductOfOrder(order.OrderId);
    }

    for(let product of productsSoled){
        let productInsit = await getProductInsites(product.ProductId,2024);
        let temp=[0,0,0,0,0,0,0,0,0,0,0,0]
        for(let item of productInsit){
            temp[item.Month]=item.quantity
        }
        productInsites[product.ProductId] = temp;
    }

    return {...user[0],...{'Orders':orders, 'catagoryes':productCatagory, 'productsSoled':productsSoled,'productInsites':productInsites,'orderDetails':orderDetails}}
}

app.post('/login', async (req, res) => {
    const user = await getUserFormId(req.body.username)
    if(user[0].Password == req.body.password){
        res.render('profile.ejs',await renderProfile(user[0].UserId))
    }
    else
        res.status(404).send('Incorrect userId or Password')
});

app.post('/profile', async(req,res)=>{
    res.render('profile.ejs',await renderProfile(req.body.UserId))
})
app.get('/getUsers', async (req, res) => {
    const ans = await getUsers();
    res.send(ans);
});
app.get('/forgotPassword',(req,res)=>{
    res.render('forgotPassword.ejs')
})



async function sendSms(To,message){
    dotenv.config();
    const client = new twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH );
    return client.messages.create({
        body:message,
        from: process.env.TWILIO_PHONE_NO,
        to: To
    })
}


async function sendMail(to,subject,message){
    dotenv.config();
    const transport = nodemailer.createTransport({
        host:'smtp.gmail.com',
        port:465,
        secure:true,
        auth:{
            user:process.env.EMAIL_ID,
            pass:process.env.EMAIL_PASS
        }
    });
    const info = await transport.sendMail({
        from:process.env.EMAIL_ID,
        to:to,
        subject:subject,
        html:message
    });
}



app.post('/resendPassword',async (req,res)=>{
    const user =await getUserFormId(req.body.UserId)
    await sendMail(user[0].Email,'Password Recovery','password: '+user[0].Password);
    await sendSms(user[0].PhoneNo,'Password Recovery \n password: '+user[0].Password);
    res.status(400).render('login.ejs');
});




app.get('/authenticate', async(req,res)=>{
    res.render('authenticate.ejs');
})


app.post('/sendEmailOtp', async (req, res) => {
    try {
        const email = req.body.Email; // Access the email field
        let pass = randomInt(100000, 999999); // Generate a random OTP
        if (!email) {
            return res.status(500).send('Email is required'); // Return if email is not provided
        }
        sendMail(email,'insta buy otp','otp: '+pass);
        const ans = await PutEmailAuth(email,pass);
        res.status(200).send(); // Respond with a success status
    } catch (error) {
        console.error('Error in /sendEmailOtp:', error);
        res.status(500).send('Internal Server Error'); // Handle errors
    }
});

app.post('/sendPhoneOtp',async(req,res)=>{
    try{
        const phoneNo= req.body.PhoneNo;
        const pass=randomInt(100000,999999);
        sendSms(phoneNo,'your instent buy password is '+pass);
        if (!phoneNo) {
            return res.status(500).send('Phone number is required');
        }
        const ans=PutPhoneAuth(phoneNo , pass)
        res.status(200).send('proper');
    }
    catch(error){
        console.log(error);
        res.status(500).send();
    }
    res.status(500).send();
})

app.post('/authenticateEmail',async(req,res)=>{
    try{
        let pass = await GetEmailAuth(req.body.email);
        pass = pass[0][0].Pass;
        if(pass && req.body.pass && pass == req.body.pass){
            await setEmailVerified(req.body.email);
            res.status(200).send();
        } 
    }
    catch{
        res.status(500).send();
    }
    res.status(500).send();
})

app.post('/authenticatePhone',async(req,res)=>{
    try{
        let pass = await GetPhoneAuth(req.body.phoneNo);
        console.log(pass)
        pass = pass[0][0].Pass;
        if(pass && req.body.pass && pass == req.body.pass){
            await setPhoneNoVerified(req.body.phoneNo);
            res.status(200).send();
        } 
    }
    catch(error){
        console.log(error);
        res.status(500).send();
    }
    res.status(500).send();
})

app.post('/createUser', async (req, res) => {
    const UserId = uniqueIdGenerator(20);
    try {
        const email_auth = await GetEmailAuth(req.body.Email);
        const phoneNo_auth = await GetPhoneAuth(req.body.PhoneNo);
        if(email_auth[0][0].verified==true && phoneNo_auth[0][0].verified==true){
            const ans = await createUser(UserId, req.body.Name, req.body.PhoneNo, req.body.Gender, req.body.Password, req.body.DOB, req.body.Email);
            res.status(200).send(ans);
        }
        res.status(500).render('errorOut.ejs');
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).render('errorOut.ejs');
    }
});
app.post('/updateUser',async (req,res)=>{
    const user = await updateUser(req.body.UserId, req.body.Name, req.body.PhoneNo, req.body.Gender, req.body.DOB, req.body.Email)
    res.render('profile.ejs',{user,})
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


async function get_ProImg (ProductId){
    const result = await getProduct(ProductId);
    if (result && result[0] && result[0].hasOwnProperty('Img1')) {
        const { Img1, Img2, Img3, Img4 } = result[0];
    

    const imgDir = process.env.IMG_DIR;
    const imgPaths = [Img1, Img2, Img3, Img4].filter(img => img);

    // Send the images as an array of base64 strings
    const images = [];
    for (const imgPath of imgPaths) {
        const imgPathFull = path.join(imgDir, imgPath);
        const imgData = fs.readFileSync(imgPathFull);
        const imgBase64 = imgData.toString('base64');
        images.push(`data:image/png;base64,${imgBase64}`);
    }
    return images
    }
    else{
        return null
    }
}



app.post('/',async(req,res)=>{
    let products=[]
    if(String(req.body.catagory)=='0'){
        products =await getAllProducts();
    }
    else{
        products = await getProductsByCatagory(req.body.catagory)
    }
    const productCatagory = await getAllCatagorys();
    for(let i=0; i<products.length ; i++){
        const images = await get_ProImg(products[i].ProductId)
        products[i]={'info':products[i],'images':images}
    }
    res.render('home.ejs',{'products':  products, 'UserId':req.body.Id,'catagoryes':productCatagory})
});

app.post('/sellProduct', upload.array('files'), async (req, res) => {
    try {
        if (req.fileValidationError) {
            return res.status(400).json({ error: req.fileValidationError });
        } else if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No files were uploaded' });
        }

        const filenames = req.files.map(file => file.filename);
        let Img1, Img2, Img3, Img4;
        if (filenames.length >= 1) Img1 = filenames[0];
        if (filenames.length >= 2) Img2 = filenames[1];
        if (filenames.length >= 3) Img3 = filenames[2];
        if (filenames.length >= 4) Img4 = filenames[3];

        const ProductId = uniqueIdGenerator(20);
        
        const { Name, Description, Discount, Price, Stock,  SellerType, SellerId} = req.body;

        const result = await sellProduct(ProductId,Name, Description, Discount, Price, Stock,  SellerType, SellerId, Img1, Img2, Img3, Img4);

        res.status(200).render('done.ejs');
    } catch (error) {
        console.error('Error selling product:', error);
        res.status(500).render('errorOut.ejs');
    }
});

app.get('/getProductDetail/:UserId/:ProductId', async (req, res) => {
    const images=await get_ProImg(req.params.ProductId)
    try {
        const result = await getProduct(req.params.ProductId); 
        const comments = await getReview(req.params.ProductId);
        res.status(200).render('viewProduct.ejs',{'info':result[0],'images':images, 'comments':comments[0],'UserId':req.params.UserId});
    }
    catch (err) {
        console.error('Error fetching product images');
        res.status(500).render('errorOut.ejs');
    }
});


app.post('/createAddress', async (req, res) => {
    const AddressId = uniqueIdGenerator(20);
    try {
        const ans = await createAddress(AddressId, req.body.Country, req.body.State, req.body.City, req.body.AddressLine1, req.body.AddressLine1, req.body.Pincode, req.body.UserId);
        res.status(200).render('done.ejs');
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).render('errorOut.ejs');
    }
});

async function getAddresses(UserId){
    try {
        const ans = await getAddressFromUserId(UserId);
        return ans;
    } catch (error) {
        return null
    }
};

app.post('/OrderProducts',async (req,res)=>{
    const OrderId = uniqueIdGenerator(20);
    const date = new Date();
    try {
        const ProductIds = req.body.productIds.split(',');
        const Quantitys = req.body.quantities.split(',');
        const Prices = req.body.prices.split(',');
        let TotalAmount=0
        for(let i=0;i<ProductIds.length;i++){
            if(Quantitys[i]>0){
            removeFromWishList(ProductIds[i]);
            TotalAmount+=Prices[i]*Quantitys[i];
            }
        }
        const result = await createOrder(OrderId,date,req.body.AddressId.substring(1,21),req.body.UserId,TotalAmount);
        for(let i=0;i<ProductIds.length;i++){
            if(Quantitys[i]>0){
                const result = await addProductToOrder(OrderId, ProductIds[i],Quantitys[i]);
                console.log(result)
            }
        }
        res.status(200).render('done.ejs');
    } catch (error) {
        console.error('Error adding product to order:'+error);
        res.status(500).render('errorOut.ejs');
    }
});

app.post('/getAllOrder', async (req, res) => {
    try {
        const { UserId } = req.body;
        const result = await getAllOrders(UserId);
        res.status(200).json(result[0]); // Send the orders data as JSON response
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).render('errorOut.ejs');
    }
});

app.post('/addProductToWishList',async(req,res)=>{
    try{
        const product =await addProductToWishList(req.body.UserId,req.body.ProductId);
        res.status(200).render('done.ejs');
    }catch(error){
        res.status(500).render('errorOut.ejs');
    }
});

app.post('/getWishList',async(req,res)=>{
    try{
        const products =await getWishList(req.body.UserId);
        for(let i=0; i<products.length ; i++){
            const images = await get_ProImg(products[i].ProductId)
            products[i]={'info':products[i],'images':images}
        }
        res.render('viewWishList.ejs',{'products':  products,'UserId':req.body.UserId});
    }catch(error){
        res.status(500).render('errorOut.ejs');
    }
});

app.post('/addReview',async(req,res)=>{
    try{
        const ReviewId=uniqueIdGenerator(20);
        const review =await addReview(ReviewId,req.body.UserId,req.body.ProductId,req.body.Comment,req.body.Ratting);
        res.status(200).render('done.ejs');
    }catch(error){
        res.status(500).render('errorOut.ejs');
    }
});



app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('errorOut.ejs');
  });



app.listen(process.env.PORT,()=>{
    console.log("easy buy started on port: "+process.env.PORT)

});
export default app;