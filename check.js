var tableData = {
    columns: [{
        field: 'package',
        title: 'Package'
    }, {
        field: 'pinned',
        title: 'Pinned'
    }, {
        field: 'pypi',
        title: 'Latest'
    }, {
        field: 'diff',
        title: 'Difference'
    }],
    data: []
}

$('#table').bootstrapTable(tableData);

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
        }).fail(function(data) {
            var underpackage = package.package.replace(/-/g, "_");
            $.get("https://pypi.python.org/pypi/" + underpackage + "/json/",
                function(data){
                    var pypi = data.info.version;
                    package['pypi'] = pypi;
                    if (package.pinned == "Not pinned!") {
                        package.diff = "N/A";
                    } else {
                        package.diff = compareVersions(package.pinned, package.pypi)
                    }
                    createRow(package);
                }).fail(function(){
                    package['pypi'] = "Error";
                    package['pinned'] = "Error";
                    createRow(package);
                })
        })
}

$(".download").click(function(){
    var textFile = "";
    var length = $('#table').bootstrapTable('getData').length;
    var type = "";
    var extension = "requirements";

    for(x=0; x < length; x++){
        textFile += $('#table').bootstrapTable('getData')[x].package + "==" + $('#table').bootstrapTable('getData')[x].pypi;

        if(x != length - 1){
            textFile += '\n';
        }
    }

    if($(this).data("type") == "csv"){
        type = "text/csv"
        extension += ".csv";
    }else{
        type = "text/plain";
        extension += ".txt";
    }

    var a = document.createElement("a"),
        file = new Blob([textFile], {type: type});
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, extension);
    else { // Others
        var url = URL.createObjectURL(file);
        a.href = url;
        a.download = extension;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);  
        }, 0); 
    }
});

function createRow(package) {
    var r = {
        'package': package.package,
        'pinned': package.pinned,
        'pypi': package.pypi,
        'diff': package.diff,
    }
    tableData.data.push(r);
    // Inefficient AF, but it works. :\
    $("#table").bootstrapTable("destroy");
    $("#table").bootstrapTable(tableData);
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
        $('#table').bootstrapTable('removeAll');
        var versions = $("#versions").val().split("\n")
        var tableData = createTableData(versions);
        tableData = checkVersions(tableData);
        $(".btn-block").prop( "disabled", false );
    });
});