const ToolDao = require('../model/ToolDao');

exports.create = async function(req, res){

    let toolInfo = {
        serialNum: req.body.serial,
        model: req.body.model,
    };

    let tool = await ToolDao.create(toolInfo);
    console.log('Successfully created tool');
    res.redirect('/landing.html');
}

exports.getAllTools = async function(req, res){
    try{
        let tools = await ToolDao.readAll();
        res.status(200);
        res.json(tools);
    } catch (error){
        console.error('error in getAllTools: ', error);
        res.status(500);
        res.json({error: 'failed to fetch tools'});
    }
}

exports.deleteTool = async function(req, res){
    const {id} = req.params;
    try{
        await ToolDao.del(id);
        res.status(200).json({success: true})
    } catch (error){
        res.status(500).json({error: "Failed to delete tool", details: error.message});
    }
}

