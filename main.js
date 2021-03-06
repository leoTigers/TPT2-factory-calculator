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
    show_inventory();
}

document.addEventListener("DOMContentLoaded", function (event) {
    init();
});

function get(object, key, default_value) {
    let result = object[key];
    return (typeof result !== "undefined") ? result : default_value;
}

class Item {
    constructor(name, tier, count = 1, depth = 0) {
        this.tier = tier;
        this.name = name;
        this.count = count;
        this.depth = depth;
        this.componentList = [];
        this.owned = 0;

        this.calc_components();
    };

    equals(other) {
        return this.tier === other.tier &&
            this.name === other.name;
    }

    calc_components() {
        if (this.tier === 0)
            return [];
        if (inventory.contains(this)) {
            let m = Math.min(inventory.count(this), this.count);
            inventory.remove(this, m);
            this.owned = m;
            if (this.count - m === 0)
                return [];
        }
        if (!recipes[this.tier][this.name]) { //
            /*if(!crafts[this.name]) {
                return;
            } else{ // a craft with a machine

            }*/
        } else { // a part or machine
            let recipe = recipes[this.tier][this.name];
            for (let i = 0; i < recipe.length; i++) {
                let _name = recipe[i].name;
                let _tier = recipe[i].tier;
                let _count = recipe[i].count;
                if (_tier === 0 && _name !== "Rubber")
                    _tier = this.tier;
                let _item = new Item(_name, _tier, _count * this.count, this.depth + 1);
                this.componentList.push(_item);
            }
        }
    };

    repr() {
        //if(this.componentList.length === 0)
        //    return;
        let s = (this.depth > 0 ? "<ul class='nested'>" : "") + "<li><span class='caret" +
            (this.componentList.length === 0 ? "-empty" : "") + "'>" + this.count + " " + this.name + " T"
            + this.tier + (this.owned > 0 ? ("    (" + this.owned + "from inventory)") : "") + "</span>";
        //console.log(s)
        for (let i = 0; i < this.componentList.length; i++) {
            s += this.componentList[i].repr();
        }
        return s + "</li></ul>";
    }

    toString() {
        return this.name + " T" + this.tier;
    }
}

class Inventory {
    constructor() {
        this.items = [];
    }

    add(item, count = 1) {
        item.count *= count;
        // try too find the item in the inventory and adds
        // to the count if found
        for (let i = 0; i < this.items.length; i++) {
            if (this.items[i].equals(item)) {
                this.items[i].count += item.count;
                return;
            }
        }
        // if not found, just add item to the list
        this.items.push(item);
    }

    remove(item, count) {
        // try too find the item in the inventory and removes
        // to the count if found
        // if count drops to 0, remove the item from inventory
        for (let i = 0; i < this.items.length; i++) {
            if (this.items[i].equals(item)) {
                this.items[i].count = Math.max(this.items[i].count - count, 0);
                if (this.items[i].count === 0) {
                    this.items.splice(i, 1);
                }
                return;
            }
        }
        console.exception("Item" + item.toString() + "not in Inventory, can't remove it");
    }

    contains(item) {
        let b = false;
        for (let i = 0; i < this.items.length; i++) {
            if (this.items[i].equals(item)) {
                b = true;
            }
        }
        return b;
    }

    count(item) {
        for (let i = 0; i < this.items.length; i++) {
            if (this.items[i].equals(item)) {
                return this.items[i].count;
            }
        }
        return 0;
    }

    clear() {
        this.items = [];
    }
}

let inventory = new Inventory();
//inventory.add(new Item("Belt", 9))
//inventory.add(new Item("Chip", 4, 10));

function end_comp_sum(dict, item) {
    let sname = item.name + "@T" + item.tier;
    //if(inventory.contains(item))
    if (item.componentList.length === 0) {
        dict[sname] = get(dict, sname, 0) + item.count;
    } else {
        for (let i = 0; i < item.componentList.length; i++) {
            end_comp_sum(dict, item.componentList[i]);
        }
    }
}

function calc_price() {
    console.log("aneurysm incoming")
    let tier_select = document.getElementById("tier");
    let machine_select = document.getElementById("machine");
    let tier = tier_select.value;
    let machine = machine_select.value;
    if (tier === "" || machine === "")
        return;

    let obj = new Item(machine, tier);


    let total_cost = {};
    end_comp_sum(total_cost, obj);
    console.log(total_cost);


    let div = document.getElementById("results");
    div.innerHTML = "<ul id='myUL'>" + obj.repr() + "</ul>";

    let table = document.getElementById("summary");
    table.innerHTML = "<tr>\n" +
        "    <th>Item</th>\n" +
        "    <th>Tier</th>\n" +
        "    <th>Amount</th>\n" +
        "  </tr>";
    let keys = Object.keys(total_cost);
    let rows = keys.length;
    for (let i = 0; i < rows; i++) {
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
    let toggler = document.getElementsByClassName("caret");
    let i;

    for (i = 0; i < toggler.length; i++) {
        toggler[i].addEventListener("click", function () {
            this.parentElement.querySelectorAll(".nested").forEach(
                el => el.parentElement === this.parentElement ? el.classList.toggle("active") : 0);
            this.classList.toggle("caret-down");
        });
    }
    show_inventory();
}

function show_inventory() {
    let table = document.getElementById("inventory_content");
    table.innerHTML = "<tr>" +
        "<th>Item</th>" +
        "<th>Tier</th>" +
        "<th>Amount</th>" +
        "</tr>"
    for (let i = 0; i < inventory.items.length; i++) {
        let tr = document.createElement("tr");

        let td1 = document.createElement("td");
        let td2 = document.createElement("td");
        let td3 = document.createElement("td");

        td1.innerHTML = inventory.items[i].name;
        td2.innerHTML = inventory.items[i].tier;
        td3.innerHTML = inventory.items[i].count;

        tr.appendChild(td1);
        tr.appendChild(td2);
        tr.appendChild(td3);
        table.appendChild(tr);
    }
}
