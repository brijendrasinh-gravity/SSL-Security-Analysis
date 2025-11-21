const DashboardLayout = require('../../model/dashboardModel');
const User = require('../../model/userModel');


exports.getLayout = async (req,res) => {
    try{
        const user_id = req.params.user_id;

        if(!user_id){
            return res.status(400).json({
                success: false,
                message: 'user id is required',
            })
        }

        const layoutRecord = await DashboardLayout.findOne({
            where:{user_id, cb_deleted:false}, 
        }) 

        return res.status(200).json({
            success:true,
            message:'layout fetched',
            data: layoutRecord ? layoutRecord.layout : null,
        })
    } catch(error){
        console.error("get layout error:", error);
        return res.status(500).json({
            success:false,
            message:'server error'
        })
    }
}

exports.saveLayout = async (req,res) => {
    try{
        const {user_id, layout} = req.body;

        if(!user_id || !layout){
            return res.status(400).json({
                success:false,
                message:'user_id and layout are required'
            })
        }

        const existing = await DashboardLayout.findOne({
            where:{user_id}, 
        });

        if(existing){
            existing.layout = layout;
            existing.updated_by = req.user_id; //or only user_id mostly req.user_id is ok for my flow
            await existing.save();

            return res.status(200).json({
                success:true,
                message:'layout updated successfully',
                data: existing.layout,
            });
        }
        const newLayout = await DashboardLayout.create({
            user_id,
            layout,
            created_by : user_id,
            updated_by : user_id,
        });

        return res.status(201).json({
            success:true,
            message:'layout saved successfully',
            data: newLayout.layout,
        });
    } catch(error){
        console.error("error in saving layout", error);
        return res.status(500).json({
            success:false,
            message:'server error pls check again'
        })
    }
};