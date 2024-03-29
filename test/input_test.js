// Test URL: http://localhost:63342/OaGsheets/test/input_test.html?input_test?fileID=1gU8DNChA-6DyCv2esNvbUcO7z86wmk_wuEIgxTpg5m4&o=%5B%220%22,%221%22,%222%22,%223%22,%224%22,%2220%22,%225%22,%2211%22,%226%22,%227%22,%228%22,%229%22,%2210%22,%2212%22,%2213%22,%2217%22,%2214%22,%2215%22%5D&asin=B01LZPZ5ZT&dy=true&d_id=1
async function main() {
    var extension_id = "nmfejpchamgnejkgfkadokkhpjkmgmam";
    var test_extension = "aapifccbfojjnaalilgfhjgfndkbpgmf"
    async function keepa(asin, d_id) {
        let response = await fetch('https://api.keepa.com/product?key=' + jumbo + '&domain=' + d_id + '&asin=' + asin + '&stats=0')
        return response.json()
    }

    async function get_cats(id, d_id){
        let response1 = await fetch("https://api.keepa.com/category?key=" + jumbo + "&domain=" + d_id + "&category=" + id)
        let my_data = await response1.json()
        //console.log(my_data)
        let category = my_data['categories'][id]
        return category
    }
    var fileID; var is_dynam; var order;


    function detrmRefPer(price, cats2) {
        // console.log("PRICE:")
        //console.log(price)
        //console.log(cats2)
        const eightPer = [
            'Camera & Photo', 'Full-Size Appliances', "Cell Phone Devices",
            "Consumer Electronics", "Personal Computers", "Video Game Consoles"
        ];
        const groceryFee = ["Grocery & Gourmet Food"];
        const twelvePer = ["3D Printed Products", "Automotive & Powersports", "Industrial & Scientific", "Food Service", "Janitorial & Scientific"];
        const specialFee = [
            "Electronics Accessories", "Furniture", "Compact Appliances",
            "Collectible Coins"
        ];
        const switch10 = ["Baby", "Beauty", "Health & Personal Care"];
        const fifteenPer = [
            "Books",
            "Industrial & Scientific",
            "Home & Garden",
            "Kitchen & Dining",
            "Mattresses",
            "Music",
            "Musical Instruments",
            "Office Prodcuts",
            "Outdoors",
            "Pet Supplies",
            "Software & Computer",
            "Video Games",
            "Sports",
            "Tools & Home Improvement",
            "Toys & Games",
            "Video & DVD",
            "Cell Phones & Accessories",
            "Everything Else",
            "Luggage & Travel Accessories",
            "Shoes, Handbags & Sunglasses",
        ];
        var refPer = 0.15
        var catName = cats2[0]["name"]
        //console.log(catName)
        //console.log(catName === "Grocery & Gourmet Food")
        if (catName === "Grocery & Gourmet Food") {
            if (price <= 15){
                refPer = 0.08
            }
            else {
                refPer = 0.15
            }
        }
        else {
            for (let each in cats2) {
                catName = cats2[each]["name"]
                //console.log("CATEGORY NAME IS: " + catName)
                for (let each1 in twelvePer) {
                    if (catName === twelvePer[each1]) {
                        refPer = .12
                    }
                }

                for (let each1 in fifteenPer) {
                    if (catName === fifteenPer[each1]) {
                        refPer = .15
                    }

                }
                for (let each1 in eightPer) {
                    if (catName === eightPer[each1]) {
                        refPer = .12
                    }
                }
                for (let each1 in switch10) {
                    if (catName === eightPer[each1]) {
                        if (price < 10) {
                            refPer = 0.8
                        }
                        if (price >= 10) {
                            refPer = .15
                        }
                    }
                }
            }
        }
        return refPer
    } // end of determine refferal percentage function

    function round_2(num){
        return (Math.round(num * 100) / 100).toFixed(2);
    }

    function isSmallLight(dimen, oz, price){
        let fee = -1;
        if (dimen[0] < 15 && dimen[1] < 12 && dimen[2] < 0.75 && price <= 10) {
            if (oz <= 6){
                fee = 2.35
            }
            else if (6 < oz && oz <= 12){
                fee = 2.49
            }
            else if (12 < oz && oz <= 16){
                fee = 3.00
            }
            return round_2(fee * 1.05)
        }
        else if (dimen[0] < 18 && dimen[1] < 14 && dimen[2] < 8 && price <= 10) {
            if (oz <= 6){
                fee = 2.53
            }
            else if (6 < oz && oz <= 12){
                fee = 2.80
            }
            else if (12 < oz && oz <= 16){
                fee = 3.59
            }
            else if (16 < oz && oz <= 32){
                fee = 4.21
            }
            else if (32 < oz && oz <= 48){
                fee = 4.94
            }
            return round_2(fee * 1.05)
        }
        else {
            return fee
        }
    }

// updates necessary stats
    function updateStats() {
        bod_width = document.getElementById("body").offsetWidth
        //TODO: Determine what other stats to show
        if (document.getElementById("body").offsetWidth < 360) {
            document.getElementById('right').style.marginLeft = "0px"
        }
        else {
            let marg = (bod_width - 340) / 2
            document.getElementById('right').style.marginLeft = marg + "px"
        }

        // vars from docuent
        let price = Number(document.getElementById("price").value)
        let cogs = Number(document.getElementById("cogs").value)
        let ship = Number(document.getElementById("ship").value)
        let other = Number(document.getElementById("other").value)
        let sales_tax = Number(document.getElementById("sales_tax").value)
        let ship_to_amz = Number(document.getElementById("ship_to_amz").value)


        //console.log(ship)
        const refPer = detrmRefPer(price, cats2)

        // vars from keepa
        const stats = object1['products'][0]['stats']['current'];
        let drop30 = object1['products'][0]['stats']['salesRankDrops30']
        let drop90 = object1['products'][0]['stats']['salesRankDrops90']
        let drop180 = object1['products'][0]['stats']['salesRankDrops180']
        let drops = drop30 + "|" + drop90 + "|" + drop180
        let sales_rank = stats[3];
        let refFee = round_2(price * refPer)
        let totFees = round_2(+refFee + ship + other + sales_tax + ship_to_amz)
        console.log(`Ref Fee: ${refFee} Ship: ${ship} Other: ${other} Sales tax: ${sales_tax} Ship to AMZ: ${ship_to_amz}`)
        let profit = round_2(price - totFees - cogs)
        let margin = round_2(profit * 100 / price)
        let roi1 = round_2(profit * 100 / cogs)
        let top_per = ((sales_rank / highest) * 100).toFixed(3)
        //console.log(isSmallLight(dimensions,weight,price))
        if (isSmallLight(dimensions, weight, price) !== -1){
            document.getElementById('s_l').disabled = false
            if (document.getElementById('s_l').checked === true){
                document.getElementById('ship').value = isSmallLight(dimensions, weight, price)
                id('fba_fbm').checked = true
                id('ship_to_amz').value = round_2(ship_amz_rate * (weight/16))
            }
            // ignore highlight
            if (isSmallLight(dimensions,weight,price) != parseFloat(ship)){
                document.getElementById('s_l').checked = false
            }
        }
        else {
            let sl_would_be = isSmallLight(dimensions, weight, 9.99)
            document.getElementById('s_l').checked = false
            document.getElementById('s_l').disabled = true
            if (ship == sl_would_be){
                document.getElementById("ship").value = pickPack;
            }
        }
        if (id('fba_fbm').checked === false){
            last_ship = id('ship').value
        }

        if (profit > 0){
            id("profit").className = "green"
        }
        else {
            id("profit").className = "red"
        }
        document.getElementById("asin").innerHTML = asin
        document.getElementById("profit").innerHTML = profit;
        document.getElementById("ref_fee").innerHTML = refFee;
        document.getElementById("total").innerHTML = totFees;
        document.getElementById("roi").innerHTML = roi1 + "%";
        document.getElementById("margin").innerHTML = margin + "%";
        document.getElementById("sr").innerHTML = sales_rank;
        document.getElementById("category").innerHTML = cat_name;
        document.getElementById("top").innerHTML = top_per + "%";
        document.getElementById("drops").innerHTML = drops
        return [price, cogs, ship, other, stats, drop30, drop90, drop180, drops, sales_rank, refFee, totFees, profit, margin, roi1, top_per]
    } // end update stats

    function updateSL() {
        if (document.getElementById('s_l').checked === true){
            let price = Number(document.getElementById("price").value)
            document.getElementById("ship").value = isSmallLight(dimensions, weight, price)
            id('ship_to_amz').disabled = false
        }
        else {
            document.getElementById("ship").value = pickPack;
            id('ship_to_amz').disabled = true
            id('ship_to_amz').value = 0
        }
        updateStats()
    }

    function mmToIn(val) {
        let num = parseFloat(val)
        return num/25.4
    }

    function gramToOz(val) {
        let num = parseFloat(val)
        return num/28.35
    }

    function id(my_id){
        return document.getElementById(my_id)
    }

    function fill_fba() {
        if (id('fba_fbm').checked === true) {
            id('ship').value = round_2(product["fbaFees"]['pickAndPackFee'] / 100)
        }
    }

    id('fba_fbm').addEventListener("click", fill_fba)

    // shrink columns
    // console.log(document.getElementById('body').offsetWidth)
    let bod_width = document.getElementById("body").offsetWidth
    if (bod_width < 360) {
        document.getElementById('right').style.marginLeft = "0px"
    }
    else {
        let marg = (bod_width - 340) / 2
        document.getElementById('right').style.marginLeft = marg + "px"
    }

    // sets asin and fileID vars from URL
    const jumbo = "889kfmf9q6qaj4mepbmrpptne4ava5jqqaien2086eh6ur1vi30f95igacrv0e3n";
    let url = window.location.search
    const urlParams = new URLSearchParams(url);
    const asin = decodeURI(urlParams.get("asin"))
    fileID = decodeURI(urlParams.get("fileID"))
    is_dynam = decodeURI(urlParams.get('dy'))
    const domain = decodeURI(urlParams.get("d_id"))
    order = urlParams.get("o")
    //console.log(order)

    const object1 = await keepa(asin, domain);
    const product = await object1['products'][0];
    var title = await product['title'];
    var length = await mmToIn(product['packageLength'])
    var height = await mmToIn(product['packageHeight'])
    var width = await mmToIn(product['packageWidth'])
    var dimensions = [length, height, width]
    //console.log(dimensions)
    dimensions.sort(function(a, b){return b-a})
    //console.log("DIMENSIONS:")
    //console.log(dimensions)
    var weight = await gramToOz(product['packageWeight'])
    //console.log(weight)
    let check_fba = product["fbaFees"]
    let pickPack;
    if (check_fba != null) {
        pickPack = await round_2(product["fbaFees"]['pickAndPackFee'] / 100);
    }
    else{
        pickPack = 0
    }
    let root_cat_id = await product['rootCategory']
    const cats = await get_cats(root_cat_id, domain);
    let cat_name = await cats['name'];
    let highest = await cats['highestRank']
    const currentStats = await object1['products'][0]['stats']['current'];
    var stats = await object1['products'][0]['stats'];
    var avg30_price = await stats['avg30'][1] / 100;
    var avg90_price = await stats['avg90'][1] / 100;
    var avg180_price = await stats['avg180'][1] / 100;
    var avg365_price = await stats['avg365'][1] / 100;
    var avg30_rank = await stats['avg30'][3]
    var avg90_rank = await stats['avg90'][3]
    var avg180_rank = await stats['avg180'][3]
    var avg365_rank = await stats['avg365'][3]
    let price = await currentStats[1] / 100;
    let sl_fee = isSmallLight(dimensions, weight, price)
    let cats2 = await product["categoryTree"]
    const refPer = detrmRefPer(price, cats2)
    document.getElementById("price").value = price;
    document.getElementById("ship").value = pickPack;
    if (sl_fee !== -1) {
        document.getElementById("s_l").checked = true;
        document.getElementById("ship").value = sl_fee
    }
    let st;
    let st_rate; let ship_amz_rate; let other_fee; let target_roi; let min_profit; let ship_set;

    // gets settings from extension
    chrome.runtime.sendMessage(extension_id, {message: "get_prefs"},
        function(response) {
            console.log(response)
            st_rate = response.sales_tax_rate
            ship_amz_rate = response.ship_amz_rate
            other_fee = response.other_fee
            target_roi = response.target_roi
            min_profit = response.min_profit
            ship_set = response.fba_fbm
            //st = round_2(response.sales_tax_rate * cogs)
            document.getElementById('sales_tax').value = 0
            id('ship_to_amz').value = round_2(ship_amz_rate * (weight/16))
            id('other').value = other_fee
            updateStats()
            console.log(ship_set)
            if (ship_set === false){
                id('fba_fbm').checked = false
                fba_fbm_toggle()
                console.log('fired')
            }
        });
    let cogs;

    async function sendInfo(token) {
        let stats = updateStats()
        console.log("SENDING")
        document.getElementById("icon").className = "fas fa-spinner fa-spin"
        setTimeout(() => {document.getElementById("icon").className = "fa-brands fa-google-drive"}, 2000)
        console.log('File ID: ' + fileID);
        let price = Number(document.getElementById("price").value)
        cogs = Number(document.getElementById("cogs").value)
        let st = Number(id('sales_tax').value)
        let ship_amz = Number(id('ship_to_amz').value)
        let ship = Number(document.getElementById("ship").value)
        let other = Number(document.getElementById("other").value)
        let sourceURL = document.getElementById("source").value
        let notes = encodeURIComponent(document.getElementById("notes").value)
        let enc_title = encodeURIComponent(title)
        let enc_cat = encodeURIComponent(cat_name)
        let is_fba = id('fba_fbm').checked
        console.log("ref per is(extension) : " + refPer)
        let refURL = `https://oa2gsheets.com/send.html?asin=${asin}&fba=${is_fba}$t=${encodeURIComponent(token)}&st=${st}&s_a=${ship_amz}&dy=${is_dynam}&top=${stats[15]}&drops=${stats[8]}&title=${enc_title}&cat=${enc_cat}&r=${stats[9]}&s=${ship}&other=${other}&fileID=${fileID}&o=${order}&cogs=${cogs}&sourceurl=${sourceURL}&refPer=${refPer}&notes=${notes}&price=${price}`;
        let codeURL = encodeURI(refURL)
        console.log("code URL: " + codeURL)
        document.getElementById("frame").src = codeURL
    }

    async function tokenThenSend(){
        console.log("hey")
        chrome.runtime.sendMessage(extension_id, {message: "id"},
            async function(response) {
                console.log(response);
                sendInfo(response.token)
            });
    }

    function search(){
        let my_url = `https://www.google.com/search?q=${encodeURIComponent(title)}`
        window.open(my_url, "_blank")
    }

    function list(){
        let my_url = "https://sellercentral.amazon.com/abis/Display/ItemSelected?asin=" + asin
        window.open(my_url, "_blank")
    }

    let s_a;
    var not_loaded;

    function get_s(){
        chrome.runtime.sendMessage(extension_id, {message: "get_spreadsheets"},
            function(response) {
                console.log(response)
                s_a = response
            });
    }
    get_s()

    function choose_s() {
        document.getElementById("spreadsheet_choice").addEventListener("change", set_file_id)
        if (not_loaded !== false) {
            let drop_down = document.getElementById("spreadsheet_choice")
            for (let each of s_a) {
                if (each.file_id !== null) {
                    if (each.def === true) {
                        let new_select = document.createElement('option')
                        new_select.appendChild(document.createTextNode(each.name + " (default)"))
                        new_select.setAttribute("selected", "true")
                        drop_down.appendChild(new_select)
                        order = each.order
                        fileID = each.file_id
                    }
                    else {
                        let new_select = document.createElement('option')
                        new_select.appendChild(document.createTextNode(each.name))
                        drop_down.appendChild(new_select)
                    }
                }
            }
            not_loaded = false
        }
    }

    function set_file_id() {
        console.log("FIRED")
        let cho = document.getElementById("spreadsheet_choice")
        let opt_name = cho.options[cho.selectedIndex].text
        console.log(opt_name)
        for (let each of s_a){
            if (opt_name === each.name || opt_name === (each.name + " (default)")){
                console.log("TRUE")
                fileID = each.file_id
                is_dynam = each.is_dynam
                order = each.order
            }
        }
    }

    tippy('#settings', {
        trigger: 'click',
        interactive: true,
        allowHTML: true,
        theme: "light",
        content: document.getElementById('form_outer').innerHTML
    })

    tippy('#price_l', {
        content: "30-day avg: " + avg30_price + '<br>' +
            "90-day avg: " + avg90_price + '<br>' +
            "180-day avg: " + avg180_price + '<br>' +
            "365-day avg: " + avg365_price,
        delay: [200, 0],
        allowHTML: true
    });

    tippy('#sr_l', {
        content: "30-day avg: " + avg30_rank + '<br>' +
            "90-day avg: " + avg90_rank + '<br>' +
            "180-day avg: " + avg180_rank + '<br>' +
            "365-day avg: " + avg365_rank,
        delay: [200, 0],
        allowHTML: true
    });
    let last_sales_tax;
    function updateSalesTax(){
        let st;
        let cogs = id('cogs').value
        if (typeof cogs === "string"){
            console.log("TRUE!")
            st = cogs * st_rate / 100
        }
        if (id('sales_tax').value == 0 || id('sales_tax').value == last_sales_tax){
            console.log('second')
            id("sales_tax").value = (round_2(st))
        }
        last_sales_tax = st
        console.log(`last sales tax ${last_sales_tax}`)
        updateStats()
    }
    let last_ship = 0

    function fba_fbm_toggle(){
        let t = id('fba_fbm')
        if (t.checked === false){ // not checked
            id('s_l').checked = false
            id('ship_to_amz').value = 0
            id('ship_to_amz').disabled = true
            if (id('ship').value === pickPack || id('ship').value === sl_fee){
                id('ship').value = last_ship
            }        }
        else {
            id('ship_to_amz').disabled = false
            id('ship').value = pickPack
            id('ship_to_amz').value = round_2(ship_amz_rate * (weight/16))
        }
        updateStats()
    }
    document.getElementById("price").addEventListener("input", updateStats);
    document.getElementById("other").addEventListener("input", updateStats);
    document.getElementById("cogs").addEventListener("input", updateSalesTax);
    document.getElementById("notes").addEventListener("input", updateStats);
    document.getElementById("ship").addEventListener("input", updateStats);
    document.getElementById("s_l").addEventListener("change", updateSL)
    id('fba_fbm').addEventListener('change', fba_fbm_toggle)
    document.getElementById("send").addEventListener("click", tokenThenSend);
    document.getElementById("google").addEventListener("click", search)
    document.getElementById("amazon").addEventListener("click", list)
    document.getElementById('settings').addEventListener("click", choose_s)
    id('sales_tax').addEventListener('input', updateStats)
    id('ship_to_amz').addEventListener('input', updateStats)
}
main()