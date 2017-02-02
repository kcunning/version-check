function checkVersions (packages) {
    console.log("Checking packages", packages)
    for (var i in packages) {
        checkVersion(packages[i])
    }
}

function checkVersion (package) {
    var package = package;
    $.get("https://pypi.python.org/pypi/" + package.package + "/json/",
        function(data){
            var pypi = data.info.version;
            package['pypi'] = pypi;
            if (package.pinned == "Not pinned!") {
                package.diff = "N/A";
            } else {
                package.diff = compareVersions(package.pinned, package.pypi)
            }
            createRow(package);
        }).fail(function() {
                package['pypi'] = "Error";
                package['pinned'] = "Error";
                createRow(package);
        }) 
}

function createRow (package) {
    var t = $("#results");
    console.log("create",package)
    var p = package;
    t.append(
        "<tr id='" + p.package +"'><td>" 
        + p.package +"</td><td>" 
        + p.pinned + "</td><td>"
        + p.pypi +  "</td><td>"
        + p.diff + "</td></tr>")
}

function compareVersions(pinned, pypi) {
    console.log("Comparing", pinned, pypi);
    if (pinned === pypi) {
        return "same"
    }
    var apin = pinned.split('.');
    var apy = pypi.split('.');
    console.log("version arrs", apin,apy)
    types = ['major', 'feature', 'bug']
    for (var i in types) {
        console.log("Checking", apin[i], apy[i], apin[i] != apy[i] )
        if (apin[i] != apy[i]) {
            return types[i]
        }
    }
    return "unknown"
}


function createTableData(versions) {
    var tableData = [];
    var operators = ["===", "!==", ">==", "<==", "~==",
        "==", ">=", "<=", "<", ">", "~=", "!="];
    for (var i in versions) {
        // Do we need to split?
        var v = versions[i];
        for (var j in operators) {
            var o = operators[j];
            if (v.includes(o)) {
                console.log(v, o);
                arr = v.split(o);
                p = {package: arr[0], pinned: arr[1]}
                tableData.push(p);
                break;
            }
            if (j == operators.length-1) {
                p = {package: v, pinned: "Not pinned!"}
                tableData.push(p)
            }
        }
    }
        // Split
        // Add to tabledata
    return tableData;

}

$(document).ready(function() {
  $('#checkVersions').click(
    function () {
        console.log("Check version firing")
        var versions = $("#versions").val().split("\n")
        var tableData = createTableData(versions);
        console.log("Table data", tableData);
        tableData = checkVersions(tableData);

    });
});