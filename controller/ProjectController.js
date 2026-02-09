const ProjectDao = require('../model/ProjectDao');


exports.createProject = async function(req, res) {
    try {
        let projectInfo = {
            name: req.body.name,
            manager: req.body.manager,
            location: req.body.location,
            workers: req.body.workers || []
        };

        let project = await ProjectDao.create(projectInfo);

        console.log('Successfully created project');
        res.status(201).json(project);

    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({ error: 'Failed to create project' });
    }
};


exports.getAllProjects = async function(req, res){
    try{
        let projects = await ProjectDao.readAll();
        res.status(200).json(projects);
    } catch (error){
        console.error('error in getAllProjects: ', error);
        res.status(500).json({error: 'failed to fetch projects'});
    }
};


exports.getProjectById = async function(req, res){
    const { id } = req.params;

    try{
        let project = await ProjectDao.read(id);

        if (!project){
            return res.status(404).json({ error: "Project not found" });
        }

        res.status(200).json(project);

    } catch (error){
        res.status(500).json({error: "Failed to fetch project", details: error.message});
    }
};


exports.deleteProject = async function(req, res){
    const { id } = req.params;

    try{
        await ProjectDao.del(id);
        res.status(200).json({ success: true });

    } catch (error){
        res.status(500).json({ error: "Failed to delete project", details: error.message });
    }
};


exports.updateProject = async function(req, res){
    const { id } = req.params;

    try{
        const updatedProject = await ProjectDao.update(id, req.body);
        res.status(200).json({ success: true, updatedProject });

    } catch (error){
        res.status(500).json({ error: "Failed to update project", details: error.message });
    }
};
