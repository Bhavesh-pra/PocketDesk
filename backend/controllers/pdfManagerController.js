const Pdf = require("../models/pdf");

const getAllPdfs = async (req,res) => {

    try{

        const pdfs = await Pdf.find({ userId: req.userId }).sort({uploadedAt:-1});

        res.json(pdfs);

    }catch(error){

        console.log(error);

        res.status(500).json({
            message:"Error fetching PDFs"
        });

    }

};

module.exports = {
    getAllPdfs
};