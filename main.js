console.log(recipes)

function init() {
    let tier_select = document.getElementById("tier");
    for (let i = 0; i < config.tiers; i++) {
        let option = document.createElement("option");
        option.value = "" + (i + 1);
        option.text = "T" + (i + 1);
        tier_select.appendChild(option);
    }
    let machine_select = document.getElementById("machine");
    for (let i = 0; i < config.machines.length; i++) {
        let option = document.createElement("option");
        option.value = config.machines[i];
        option.text = config.machines[i];
        machine_select.appendChild(option);
    }
}

document.addEventListener("DOMContentLoaded", function(event){
    init();
});

function get(object, key, default_value) {
    let result = object[key];
    return (typeof result !== "undefined") ? result : default_value;
}

class Item{
    constructor(name, tier, count= 1, depth= 0) {
        this.tier = tier;
        this.name = name;
        this.count = count;
        this.depth = depth;
        this.componentList = [];
        /*this.end_components = {}
        let ec = this.calc_components();
        for(let i = 0; i < ec.length;i++){
            let sname = ec[i].name+" T"+ec[i].tier;
            this.end_components[sname] = get(this.end_components, sname, 0) + ec[i].count;
        }*/
        this.calc_components();
    };
    calc_components(){
        if(this.tier===0)
            return [];
        if(!recipes[this.tier][this.name]){ //
            /*if(!crafts[this.name]) {
                return;
            } else{ // a craft with a machine

            }*/
        }else{ // a part or machine
            let recipe = recipes[this.tier][this.name];
            for(let i = 0 ; i < recipe.length ; i++){
                let _name = recipe[i].name;
                let _tier = recipe[i].tier;
                let _count = recipe[i].count;
                if(_tier === 0 && _name !== "Rubber")
                    _tier = this.tier;
                let _item = new Item(_name, _tier, _count*this.count, this.depth+1);
                this.componentList.push(_item);
            }
        }
    };
    repr(){
        //if(this.componentList.length === 0)
        //    return;
        let s = "--".repeat(this.depth) + " "+this.count + " "+ this.name+" T"+this.tier+"\n";
        //console.log(s)
        for(let i = 0 ; i < this.componentList.length ; i++) {
            s+=this.componentList[i].repr();
        }
        return s
    }
}

class Inventory{
    constructor() {
        this.items = [];
    }
}

let inventory = new Inventory();

function end_comp_sum(dict, item){
    let sname = item.name+"@T"+item.tier;
    if(item.componentList.length === 0){
        dict[sname] = get(dict, sname, 0) + item.count;
    }else{
        for(let i = 0 ; i < item.componentList.length ; i++){
            end_comp_sum(dict, item.componentList[i]);
        }
    }
}

function calc_price(){
    console.log("aneurysm incoming")
    let tier_select = document.getElementById("tier");
    let machine_select = document.getElementById("machine");
    let tier = tier_select.value;
    let machine = machine_select.value;
    if(tier==="" || machine==="")
        return;

    let obj = new Item(machine, tier);


    let total_cost = {};
    end_comp_sum(total_cost, obj);
    console.log(total_cost);


    let div = document.getElementById("results");
    div.innerHTML = obj.repr().replaceAll("\n", "<br/>");

    let table = document.getElementById("summary");
    table.innerHTML = "<tr>\n" +
        "    <th>Item</th>\n" +
        "    <th>Tier</th>\n" +
        "    <th>Amount</th>\n" +
        "  </tr>";
    let keys = Object.keys(total_cost);
    let rows = keys.length;
    for(let i=0;i<rows;i++){
        let tr = document.createElement("tr");

        let td1 = document.createElement("td");
        let td2 = document.createElement("td");
        let td3 = document.createElement("td");
        [name, tier] = keys[i].split("@");
        td1.innerHTML = name;
        td2.innerHTML = tier;
        td3.innerHTML = total_cost[keys[i]];
        tr.appendChild(td1);
        tr.appendChild(td2);
        tr.appendChild(td3);
        table.appendChild(tr);
    }

    console.log(total_cost);
}
