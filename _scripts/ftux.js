
//FTUX: First Time User Experience
//
//This is to help with the empty state of the app on first use.

(function(){

    function loadFTUX () {
        //Hide everything!
        $("#sidebar").css("left", "-300px");
        $("#project-settings, #printConsoleTitle, #printConsole .alert, #printConsole .panel").fadeOut();
        //Show FTUX
        $("#ftux").css('opacity', '1.0');
    }

    function autoGuessProjectsFolder () {
        var autoProjects = ["websites", "repos", "repositories", "projects", "github"];
        var projectsFolder = "";

        var homePath = "";
        var myDocsPath = "";
        if (ugui.platform == "linux") {
            homePath = process.env.HOME;
            myDocsPath = homePath + "/Documents";
        } else if (ugui.platform == "win32") {
            homePath = process.env.USERPROFILE;
            myDocsPath = homePath + "\\Documents";
        }

        var contents = ugui.helpers.readAFolder(homePath);
        for (var i = 0; i < contents.length; i++) {
            for (var j = 0; j < autoProjects.length; j++) {
                if (contents[i].name.toLowerCase() == autoProjects[j]) {
                    projectsFolder = homePath.split('\\').join('/') + '/' + contents[i].name;
                }
            }
        }
        if (!projectsFolder) {
            var myDocsContents = ugui.helpers.readAFolder(myDocsPath);
            for (var i = 0; i < myDocsContents.length; i++) {
                for (var j = 0; j < autoProjects.length; j++) {
                    if (myDocsContents[i].name.toLowerCase() == autoProjects[j]) {
                        projectsFolder = myDocsPath.split('\\').join('/') + '/' + myDocsContents[i].name;
                    }
                }
            }
        }
        if (!projectsFolder && ugui.platform == "win32") {
            //Each drive letter adds like half a second to load time, so I limited them to the common ones
            var driveLetters = ["C", "D", "E", "F", "G", "H", "M", "N", "X", "Y", "Z"];
            var shortProjects = ["GitHub", "Projects"];
            var fs = require('fs');
            var stats = "";
            for (var i = 0; i < driveLetters.length; i++) {
                for (var j = 0; j < shortProjects.length; j++) {
                    var driveAndFolder = driveLetters[i] + ":/" + shortProjects[j];
                    try {
                        stats = fs.lstatSync(driveAndFolder);
                        if (stats.isDirectory()) {
                            projectsFolder = driveAndFolder;
                            scout.ftux.projectsFolder = projectsFolder;
                            return;
                        }
                    }
                    catch (err) {
                        continue;
                    }
                }
            }
        }

        scout.ftux.projectsFolder = projectsFolder;
    }

    function autoGrabProjects () {
        var projectsFolder = scout.ftux.projectsFolder;
        var projects = "";
        if (projectsFolder) {
            projects = ugui.helpers.readAFolder(projectsFolder);
        }
        if (!projectsFolder || projects.length < 1) {
            $("#ftux .panel-body").html("No projects found.");
            return;
        }
        for (var i = 0; i < projects.length; i++) {
            if (projects[i].isFolder) {
                var name = projects[i].name;
                var item =
                  '<label class="col-xs-6">' +
                    '<input type="checkbox" value="' + projectsFolder + '/' + name + '" checked> ' +
                    name +
                  '</label>';
                $("#ftux .panel-body").append(item);
            }
        }
    }

    function updatePanelContent () {
        if (scout.ftux.projectsFolder) {
            if (ugui.platform == "win32") {
                $("#ftuxProjectsFolder").text(scout.ftux.projectsFolder.split('/').join('\\'));
            } else {
                $("#ftuxProjectsFolder").text(scout.ftux.projectsFolder);
            }
        }
    }

    //The main FTUX function
    function ftux () {
        if (scout.projects.length < 1) {
            loadFTUX();
            autoGuessProjectsFolder();
            autoGrabProjects();
            updatePanelContent();
            console.log(scout.ftux);
        }
    }

    //run once
    ftux();
    scout.helpers.ftux = ftux;

})();
