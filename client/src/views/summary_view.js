const PubSub = require('../helpers/pub_sub.js');
const RecipeView = require('./recipe_view.js');

const SummaryView = function (summaryContainer) {
    this.summaryContainer = summaryContainer;
    this.allPotentialMinerals = {
        "CA": "Calcium",
        "CHOCDF": "Carbs",
        "CHOLE": "Cholesterol",
        "ENERC_KCAL": "Energy",
        "FASAT": "Sugars",
        "FAT": "Fat",
        "FE": "Iron",
        "FIBTG": "Fibre",
        "FOLDFE": "Folic Acid",
        "K": "Potassium",
        "MG": "Magnesium",
        "NA": "Sodium",
        "NIA": "Niacin (B3)",
        "P": "Phosphorus",
        "PROCNT": "Protein",
        "RIBF": "Riboflavin (B2)",
        "THIA": "Thiamin (B1)",
        "TOCPHA": "Vitamin E",
        "VITA_RAE": "Vitamin A",
        "VITB12": "Vitamin B12",
        "VITB6A": "Vitamin B6",
        "VITC": "Vitamin C",
        "VITD": "Vitamin D",
        "VITK1": "Vitamin K",
        "ZN": "Zinc"
    }

}

SummaryView.prototype.bindEvents = function () {
    PubSub.subscribe('FormView:all-data-ready', (event) => {
        const allData = event.detail;
        console.log(allData);
        this.summaryContainer.innerHTML = ""
        this.renderSummary(allData);
        this.createRecipeButtons();
    })
}

SummaryView.prototype.renderSummary = function (allData) {
    const summaryHeading = document.createElement('h2');
    summaryHeading.textContent = 'Your Daily Summary'
    const unorderedList = document.createElement('ul');
    const nutrientInfoObject = {};
    for (const mineral in this.allPotentialMinerals) {
        const listItem = document.createElement('li');
        listItem.textContent = `${this.allPotentialMinerals[mineral]}: ${this.calculateTotal(allData, mineral)}%`
        unorderedList.appendChild(listItem);
        nutrientInfoObject[mineral] = {
            name: this.allPotentialMinerals[mineral],
            amount: this.calculateTotal(allData, mineral)
        };
    };
    this.summaryContainer.appendChild(summaryHeading);
    this.summaryContainer.appendChild(unorderedList);
    this.threeMostDeficientNutrients = this.getThreeMostDeficientNutrients(nutrientInfoObject);
   // console.log(this.threeMostDeficientNutrients);
  //  this.displayRecipes(this.threeMostDeficientNutrients);
    this.publishNutrientObject(nutrientInfoObject);
}

SummaryView.prototype.publishNutrientObject = function(nutrientInfoObject){
    PubSub.publish("SummaryView:nutrient-object-ready", nutrientInfoObject);
}

SummaryView.prototype.calculateTotal = function (allData, mineral) {
    let totalPercentage = 0;
    for (const dataItem of allData ) {
        if (dataItem.details[mineral]) {
            const amountOfUnits = dataItem.amount;
            totalPercentage += (dataItem.details[mineral].quantity * amountOfUnits);
        }
    }
    return totalPercentage.toFixed(2);
}

SummaryView.prototype.displayRecipes  = function(threeMostDeficientNutrients){
    const recipeDiv = document.querySelector("#recipe-suggestions");
    const recipeView = new RecipeView(recipeDiv);
    recipeView.displayInitialSuggestions(threeMostDeficientNutrients);
}

SummaryView.prototype.getThreeMostDeficientNutrients = function(nutrientInfoObject){
    const nutrientInfoArray = [];
    for(const objectKey of Object.keys(nutrientInfoObject)){
        nutrientInfoArray.push(nutrientInfoObject[objectKey]);
    };
    nutrientInfoArray.sort((object1, object2)=>{
        return object1.amount - object2.amount;
    });
    const nutrientNameArray = nutrientInfoArray.map((object)=>{
        return object.name;
    });
    console.log(nutrientNameArray);
    return nutrientNameArray.slice(0,3);
}

SummaryView.prototype.createRecipeButtons = function(){
    const div = document.createElement('div');
    this.threeMostDeficientNutrients.forEach((nutrient)=>{
        const button = document.createElement('button');
        button.textContent = nutrient + " rich recipes";
        button.addEventListener('click', (event)=>{
            PubSub.publish(`SummaryView:nutrient-clicked`, nutrient);
        });
        div.appendChild(button);
    });
    this.summaryContainer.appendChild(div);
}

module.exports = SummaryView;
