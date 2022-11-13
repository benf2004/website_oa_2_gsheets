    // setup url parsing and create variable with ASIN
    let data1;
    let url = window.location.search 
    const urlParams = new URLSearchParams(url);
   	var asin = decodeURI(urlParams.get("asin"))
    var has_headers = decodeURI(urlParams.get("h"))
	
      
	// define nested functions. All main operations take place in top1. 
    async function top1(){

	// Create variables for desired statistics from Keepa JSON
	var currentRank = decodeURI(urlParams.get('r'))
	var ship = parseFloat(decodeURI(urlParams.get('s')));
    var other = parseFloat(decodeURI(urlParams.get('other')));
    var cat_name = decodeURIComponent(urlParams.get('cat'));
    var title = decodeURIComponent(urlParams.get('title'));
    var drops = decodeURIComponent(urlParams.get('drops'));
    var token = decodeURIComponent(urlParams.get('t'))
    var today = new Date();
	var curDate = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
	var asinLink = '=HYPERLINK("amazon.com/dp/' + asin + '"' + "," + '"' + asin + '"' + ")"
	var sellLink = "https://sellercentral.amazon.com/product-search/search?q=" + asin;
    const API_KEY = 'AIzaSyCVDFngfv325nliz9gbWum6pvTYfjDP_fg';
    var price = parseFloat(decodeURI(urlParams.get("price")));
    var top_per = decodeURI(urlParams.get("top")) + "%";
	var cogs = parseFloat(decodeURI(urlParams.get("cogs")));
    console.log(`COGS: ${cogs}`)
	var sourceURL = decodeURI(urlParams.get("sourceurl"))
	var notes = decodeURIComponent(urlParams.get("notes"))
    console.log(`notes is ${notes}`)
    var refPer = "=TO_PERCENT(" + decodeURI(urlParams.get("refPer")) + ")";
    var ref_num = decodeURI(urlParams.get('refPer'))
    var is_dynam = decodeURI(urlParams.get("dy"))


        // Sets dynamic statistic array to send to spreadsheet. requires row number.
    function dynamStats(rowStr, order) {
        const alpha_dict = {}
        const alphabet = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"]
        let num = 0
        for (let each of order) {
            alpha_dict[each] = alphabet[num]
            num += 1
        }
        const a = alpha_dict
        console.log(JSON.stringify(a))
        console.log("AlPHA DICT:")
        console.log(a)

        // refer to picker id_num_dict to see order
        let refFee1 = `=ROUND(${a['8']}${rowStr}*${a['10']}${rowStr}, 2)`;
        let totFees1 = `=${a['12']}${rowStr}+${a['13']}${rowStr}+${a['17']}${rowStr}`;
        let profit1 = `=${a['8']}${rowStr}-${a['14']}${rowStr}-${a['7']}${rowStr}`;
        let margin = `=TO_PERCENT(${a['9']}${rowStr}/${a['8']}${rowStr})`;
        let sales_tax = 0;
        let roi1 = `=TO_PERCENT(${a['9']}${rowStr}/${a['7']}${rowStr})`;
        let proceeds = `=${a['8']}${rowStr}-${a['14']}${rowStr}`;
        const my_list = [curDate, asinLink, title, roi1, currentRank, cat_name, sourceURL, cogs, price, profit1, refPer, notes, refFee1, ship, totFees1, sellLink, margin, other, sales_tax, proceeds, top_per, drops];
        console.log(my_list)
        return my_list
    }; // end of dynamic stats function

    function staticStats(){
        let refFee1 = price * ref_num
        let ref_fee = `=ROUND(${refFee1}, 2)`
        let totFees1 = refFee1 + ship + other
        let tot_fees = `=ROUND(${totFees1}, 2)`
        let profit1 = price - totFees1 - cogs
        let roi1 = profit1 / cogs
        let margin = profit1 / price
        let sales_tax = 0;
        let proceeds = price - totFees1;
        const my_list = [curDate, asinLink, title, roi1, currentRank, cat_name, sourceURL, cogs, price, profit1, refPer, notes, ref_fee, ship, tot_fees, sellLink, margin, other, sales_tax, proceeds, top_per, drops];
        return my_list
    }

    async function finish(rowFin, order_array) {
        console.log("row num:" + rowFin)
        console.log("ROWWWwwYYWY")
        if (is_dynam == "false") {
            data1 = staticStats()
        }
        else {
            data1 = dynamStats(rowFin, order_array); // gets statistics
        };
        let send_data = orderSend(data1, order_array)
        let range1 = getRange(order_array, rowFin) // creates range from row number
        sendToSheets(send_data, range1); // sends data to gsheets
    }

     async function get_row_num(fileID, o) {
        var order = o;
        async function get_data() {
            const request = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${fileID}/values/${encodeURIComponent("A:Z")}`,
                {
                    headers: {
                        "Accept": "application/json",
                        Authorization: `Bearer ${token}`
                    }
                })
            return request.json()
        }
        let data = await get_data();
        console.log(data)
        let rowNum = await (data.values).length + 1;
        console.log(`rowNUM: ${rowNum}`)
        await finish(rowNum, order)
    }

    function orderSend(data, order){
        console.log("ORDER IS:")
        console.log(order)
        const send = []
        for (let each of order){
            let num_each = parseInt(each)
            send.push([data[num_each]])
        }
        let final_send = Object.values(send)
        return final_send
    };

    function getRange(order, row_num){
        const alphabet = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"]
        const range = `A${row_num}:${alphabet[order.length - 1]}${row_num}`
        console.log("range: " + range)
        return range
    };

    function sendToSheets(send, range){
        fetch(`https://sheets.googleapis.com/v4/spreadsheets/${fileID}/values/${encodeURIComponent(range)}?responseDateTimeRenderOption=FORMATTED_STRING&responseValueRenderOption=FORMATTED_VALUE&valueInputOption=USER_ENTERED&key=${API_KEY}`,{
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                "majorDimension":"COLUMNS",
                "range": range,
                "values": send
            })
        })
    }

    if (has_headers === 'true'){
        var fileID = decodeURI(urlParams.get("fileID"))
        console.log("processing headers")
        const headers = urlParams.get('heads') //removed json.parse
        console.log("HEADERS:")
        console.log(headers)
        let json_h = headers.split(",")
        console.log(json_h)
        let new_h = []
        for (let each of json_h){
            new_h.push([each])
        }
        let h_range = getRange(json_h, "1")
        console.log("range: " + h_range)
        sendToSheets(new_h, h_range)
    }
    else {
        if (asin !== null) {
            var fileID = decodeURI(urlParams.get("fileID"))
            console.log(decodeURI(urlParams.get('o')));
            const o = JSON.parse(decodeURI(urlParams.get('o')))
            const order_array = Object.values(o)
            console.log(order_array)
            console.log(`spreadsheet id: ${fileID}`);  // gets spreadsheet id num
            await get_row_num(fileID, order_array) // gets row number
        }
    }
    } // end of top1
    var fileID = decodeURI(urlParams.get("fileID"))
    top1()