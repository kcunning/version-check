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
        + "??" + "</td></tr>")
}


function createTableData(versions) {
    var tableData = []
    var operators = ["===", "!==", ">==", "<==", "~==",
        "==", ">=", "<=", "<", ">", "~=", "!="]
    for (var i in versions) {
        // Do we need to split?
        var v = versions[i]
        for (var j in operators) {
            var o = operators[j];
            if (v.includes(o)) {
                console.log(v, o)
                arr = v.split(o)
                p = {package: arr[0], pinned: arr[1]}
                tableData.push(p)
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