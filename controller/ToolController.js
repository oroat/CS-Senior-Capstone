const ToolDao = require('../model/ToolDao');

exports.create = async function(req, res){

    let toolInfo = {
        serialNum: req.body.serial,
        model: req.body.model,
    };

    let tool = await ToolDao.create(toolInfo);
    res.redirect('/tools.html');
}

exports.getAllTools = async function(req, res){
    try{
        let tools = await ToolDao.readAll();
        res.status(200);
        res.json(tools);
    } catch (error){
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

exports.update = async function(req, res){
    const id = req.body.id;
    const updates = {};

    //might need to make the conditional check against "" instead of null
    if (req.body.updates.serial != null) updates.serialNum = req.body.updates.serial;
    if (req.body.updates.model !=  null) updates.model = req.body.updates.model;
    if (req.body.updates.inUse != null) updates.inUse = req.body.updates.inUse;
    if (req.body.updates.inUse == false) updates.usedBy = null;
    if (req.body.updates.usedBy != null) updates.usedBy = req.body.updates.usedBy;
    
    try{
        const updatedTool = await ToolDao.update(id, updates);
        res.status(200);
        res.json({success: true, updatedTool, redirect: req.body.redirectTo});
    } catch (error){
        res.status(500);
        res.json({error: "Failed to update user role", details: error.message});
    }
}

exports.getToolBySerial = async function(req, res){
    try{
        const tool = await ToolDao.findBySerial(req.params.serial);
        res.status(200);
        res.json(tool);

    } catch(error){
        res.status(500);
        res.json({error: "Failed to find tool", details: error.message});
    }
}

exports.getToolById = async function(req, res){
    try{
        const tool = await ToolDao.read(req.params.id);
        res.status(200);
        res.json(tool);
    } catch(error){
        res.status(500);
        res.json({error: "Failed to find tool", details: error.message})
    }
}

