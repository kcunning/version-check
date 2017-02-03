function checkVersions (packages) {
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
    var p = package;
    t.append(
        "<tr id='" + p.package +"'><td>" 
        + p.package +"</td><td>" 
        + p.pinned + "</td><td>"
        + p.pypi +  "</td><td>"
        + p.diff + "</td></tr>")
}

function compareVersions(pinned, pypi) {
    pinned = pinned.split(";")[0];
    if (pinned === pypi) {
        return "same"
    }
    var apin = pinned.split('.');
    var apy = pypi.split('.');
    types = ['major', 'feature', 'bug']
    for (var i in types) {
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
        var versions = $("#versions").val().split("\n")
        var tableData = createTableData(versions);
        tableData = checkVersions(tableData);

    });
});