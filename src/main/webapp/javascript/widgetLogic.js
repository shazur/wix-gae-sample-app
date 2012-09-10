function getAllMethods() {
    return Object.getOwnPropertyNames(Wix).filter(function(property) {
        return typeof Wix[property] == 'function';
    });
}


$("#runA").click(function() {
//    var sdkFunctions = getAllMethods();
//    sdkFunctions.forEach(function(func){});
    var a = "hello world";
    Wix.refreshApp();
    var result = "failed";
    if (!a) result = "passed";
    var resultElement = document.createElement('div');
    resultElement.innerHTML = result;
    $(".container-fluid thumbnail").appendChild(resultElement);
});

$("#runB").click(function() {
//    var sdkFunctions = getAllMethods();
//    sdkFunctions.forEach(function(func){});
    Wix.openPopUp("http://www-beta.statcounter.com/counter/counter_iframe.html?instance=yl2VUk-boABRjRWPQIOvmvvkpI6xIgcBUPz50Iu2kNA.eyJpbnN0YW5jZUlkIjoiMTJiMjdjNmYtOGU0YS05NTlmLTJiNGMtN2EwM2RmNDMyN2FlIiwic2lnbkRhdGUiOiIyMDEyLTA5LTEwVDE0OjUzOjEyLjAyNiswMzowMCIsInVpZCI6IjE4MGFkMGJhLThkYzYtNGJlNi04MmMzLWY3ZWZlNzBlN2M1NyIsInBlcm1pc3Npb25zIjoiT1dORVIiLCJpcEFuZFBvcnQiOiIxMjcuMC4wLjEvNTU5OTAiLCJkZW1vTW9kZSI6ZmFsc2V9&section-url=http%3A%2F%2Fwww-beta.statcounter.com%2Fcounter%2Fcounter_iframe.html%3F&target=_self&width=180&viewMode=preview&compId=TPWdgt1",
                  "normal",
                  {top: 40, left: 40, bottom: 'auto', right: 'auto', width: 300, height: 500});
    

    var result = "failed";
    if (!a) result = "passed";
    var resultElement = document.createElement('div');
    resultElement.innerHTML = result;
    $(".container-fluid thumbnail").appendChild(resultElement);
});