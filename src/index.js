import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
const { evaluate } = require('mathjs');
const MongoClient = require('mongodb').MongoClient;

var operations = ['cos', 'sin', 'tg', 'ctg','sqrt'];

var lightGray1 = "#ebebeb";
var darkGray1 = "#969696";

var lightBlue1 = "#03bafc";
var darkLightBlue1 = "#0085b5";




class App extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			page: 0,
		}
	}
	
	render(){
		return(
			<>
			<nav>
				<TopMenu/>
			</nav>
			<main>
				<div class="mainContainer">
					<div class="mainCard">
						<EquationEditor id="A"/>
					</div>
				</div>
				<div class="typeSelector">
						<TypeSelector/>
				</div>
			</main>
			</>
		);
	}
}

class InputField extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			id: props.id,
			num: null,
			numLength: 0,
		}
	}
	
	render(){
		return(
			<>
			<div class="additionSymboll">{(this.props.id).substring((this.props.id).indexOf("_")+1)+" :"}</div>
			<input class="inputField" rows='1' id={"field"+this.props.id} ></input>
			</>
		);
	}
}


class EquationEditor extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			eq: "",
			numberOfVars: 0,
			fieldsArray: [],
			isOutReady: false,
			out: null,
		}
	}
	
	calculateEquation(){
		let isReady = 1;
		let out = 0;
		this.state.fieldsArray.forEach((id) => {
			console.log(id);
			if(isNaN(parseFloat(document.getElementById("field"+id).value)))
			{
				isReady = 0;
			}
		});
		if(isReady == 1)
		{

			let scope = {};
			this.state.fieldsArray.forEach((id) => {
				scope[id.substring(2)] = document.getElementById("field"+id).value;
			});
			console.log(scope);
			console.log(this.state.eq);
			let out = evaluate(this.state.eq, scope);
			this.setState({
				eq: this.state.eq,
				numberOfVars: this.state.numberOfVars,
				fieldsArray: this.state.fieldsArray,
				isOutReady: true,
				out: out,
			});
		}
		console.log(isReady);
	}
	
	swapSymbols(){
		let equation = this.state.eq;
		
		for(var i = 0; i < this.state.numberOfVars; i++)
		{
			let localId = this.state.fieldsArray[i].substring(this.state.fieldsArray[i].indexOf(this.props.id + "_")+2);
			console.log(localId);
			equation = equation.substring(0, equation.indexOf(localId)) + document.getElementById("field" + this.state.fieldsArray[i]).value + equation.substring(equation.indexOf(localId)+localId.length);
			console.log(equation);
		}
		
		return equation;
	}
	
	parseEquation(bracketString){
		console.log(bracketString+"-----------------------");
		let equation = bracketString;
		let arrayOfSymbols = [];
		let numberOfSymbols = 0;
		console.log(this.state);
		while(bracketString.length >= 1)
		{
			let singleOp = bracketString.substring(0,1);
			console.log(singleOp);
			if(singleOp > '0' && singleOp < '9' )
			{
				console.log("number found");
				let number1 = bracketString.match(/\d+/)[0];
				bracketString = bracketString.substring(bracketString.match(/\d+/)[0].length);
			}else if(singleOp == '+' || singleOp == '-' || singleOp == '*' || singleOp == '/')
			{
				console.log("operator found");
				bracketString = bracketString.substring(1);
			} else if(singleOp.match(/[a-zA-Z]*/)[0].length>0){
				console.log("symbol found");
				if(operations.indexOf(bracketString.match(/[a-zA-Z]*/)[0]) == -1)
				{
					let id = bracketString.match(/[a-zA-Z]*/)[0];
					arrayOfSymbols[numberOfSymbols] = this.props.id + "_" + id;
					numberOfSymbols = numberOfSymbols + 1;
				}
				bracketString = bracketString.substring(bracketString.match(/[a-zA-Z]*/)[0].length);
				
			}else{
				bracketString = bracketString.substring(1);
			}
		}
		this.setState({
			eq: equation,
			numberOfVars: numberOfSymbols,
			fieldsArray: arrayOfSymbols,
			isOutReady: false,
			out: null,
		});
		
	}
	
	renderInputFields(){
		
		
		
		{
			if(this.state.numberOfVars != 0)
			{
				return(this.state.fieldsArray.map((id) => (<InputField id={id}></InputField>)));
			}else{
				return(<div class="inputFieldsPlaceholder">Input fields for variables used in equation will appear here</div>);
			}
		}
		
		
	}
	
	renderOutput(){
		return(
		<>
		{
			this.state.out
		}
		</>
		);
	}
	
	render(){
		return(
		<>
		<div class="editorContainer">
			<div class="row1">
				<div class="eqLabel">Equation :</div>
				<div class="outputLabel">Output :</div>
			</div>
			<div class="row2">
				<textarea class="mainEqEditor" id="mainEqEditor" placeholder="Type in your equation" onChange={(e) => {this.parseEquation(e.target.value)}} onClick = {(e) => {this.parseEquation(e.target.value)}}></textarea>
				<button class="calcBtn" onClick={() => {this.calculateEquation()}}>Calculate</button>
				<div class="eqOutput">{this.renderOutput()}</div>
			</div>
			
			<div class="row5">	
				<div class="column_1">
					<div class="inputFieldsLabel">Variables inputs :</div>
					{this.renderInputFields()}
				</div>
			</div>
		</div>
		</>
		);
	}
}

class TypeSelector extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			type: 1,
			isAnimRunning: 0,
			formulas: {},
			isDbReady: 0,
			mathListArray:[],
			physicsListArray:[],
			customListArray:[]
		}

		this.getFormulas();
	}
	
	setType(typeNr)
	{
		let prevType = this.state.type;
		if(prevType != typeNr && this.state.isAnimRunning != 1)
		{
			this.state.isAnimRunning = 1;
			document.getElementById("sel"+prevType+"Container").style.height = "60px";
			setTimeout((typeNr) => { 
				document.getElementById("sel"+prevType+"Container").style.backgroundColor = "#969696";
				document.getElementById("sel"+prevType).style.backgroundColor = "#ebebeb";
				document.getElementById("sel"+prevType+"Container").style.zIndex = 1;
				document.getElementById("sel"+typeNr+"Container").style.backgroundColor = "#0085b5";
				document.getElementById("sel"+typeNr).style.backgroundColor = "#03bafc";
				document.getElementById("sel"+typeNr+"Container").style.zIndex = 2;
				document.getElementById("sel"+typeNr+"Container").style.height = "80px";
				this.setState({
					type: typeNr,
					isAnimRunning: 0
				});
			}, 500, typeNr);
		}
	}


	getFormulas(){
		
		fetch('./dataBase/formulasBd.json')
		.then(response => response.json())
		.then(data => {
			this.setState({
				formulas: data,
				isDbReady: 1
			});
			console.log(this.state.formulas);
			let formulasArr = this.state.formulas.mathFormulas.formulas;
			let mathArr = [];
			let physicsArr = [];
			let customArr = [];
			for(var i = 0; i < formulasArr.length; i++)
			{
				mathArr.push(<EquationFormula key={"mathFormula"+i} name={formulasArr[i].name} formula={formulasArr[i].formula} description={formulasArr[i].description}></EquationFormula>);
			}
			formulasArr = this.state.formulas.physicsFormulas.formulas;
			for(var i = 0; i < formulasArr.length; i++)
			{
				physicsArr.push(<EquationFormula key={"physicsFormula"+i} name={formulasArr[i].name} formula={formulasArr[i].formula} description={formulasArr[i].description}></EquationFormula>);
			}
			formulasArr = this.state.formulas.customFormulas.formulas;
			for(var i = 0; i < formulasArr.length; i++)
			{
				customArr.push(<EquationFormula key={"customFormula"+i} name={formulasArr[i].name} formula={formulasArr[i].formula} description={formulasArr[i].description}></EquationFormula>);
			}
			this.setState({
				mathListArray: mathArr,
				physicsListArray: physicsArr,
				customListArray: customArr
			});
		});
		
	}

	renderSelection()
	{
		if(this.state.type == 1)
		{
			return(
			<>
				{this.state.mathListArray}
			</>);
			
		}else if(this.state.type == 2)
		{
			return(
			<>
				{this.state.physicsListArray}
			</>);
			
		}else{
			return(
			<>
				{this.state.customListArray}
			</>);
			
		}
	}
	
	render(){
			
		return(
		<div class="selectorContainer">
			<div class="selectorRow">
				<div class="mathSelectorContainer" id="sel1Container" onClick={() => {this.setType(1)}}>
					
						<div class="mathSelector" id="sel1">
						Math
						</div>
					
				</div>
				<div class="physicsSelectorContainer" id="sel2Container" onClick={() => {this.setType(2)}}>
					
						<div class="physicsSelector" id="sel2">
						Physics
						</div>
					
				</div>
				<div class="customSelecttorContainer" id="sel3Container" onClick={() => {this.setType(3)}}>
					
						<div class="customSelecttor" id="sel3">
						Custom
						</div>
					
				</div>
			</div>
			<div class="listWrapper">
				<div class="mathListContainer">
					{this.renderSelection()}
				</div>
			</div>
		</div>
		);
	
		
	}
}
	

class EquationFormula extends React.Component{
	constructor(props){
		super(props);
		this.state ={
			name: this.props.name,
			formula: this.props.formula,
			description: this.props.description
		};
		this.insertFormula = this.insertFormula.bind(this);
	}

	insertFormula(){
		console.log(this.state.formula);
		var equationEditor = document.getElementById("mainEqEditor");
		equationEditor.value = equationEditor.value.substring(0,equationEditor.selectionStart) + this.state.formula + equationEditor.value.substring(equationEditor.selectionStart);
		equationEditor.click();
	}

	render(){
		return(
		<>
		<div class="formulaWrapper">
			<div class="formulaName">
				{this.state.name}
			</div>
			<div class="formulaEquationWrapper">
				<div class="formulaEquationCol1">
					<div class="formulaLabel">
							Formula :
					</div>
					<div class="formulaEquation">
						{this.state.formula}
					</div>
				</div>
				<div class="formulaEquationCol2">
					<button class="insertButton" onClick={this.insertFormula}>Insert</button>
				</div>
			</div>
			<div class="descriptionLabel">
					Description :
			</div>
			<div class="formulaDescription">
				{this.state.description}
			</div>
		</div>
		</>
		);
	}
}



class TopMenu extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			isOnTop: 1,
		}
		this.setScrollEvent = this.setScrollEvent.bind(this);
		this.updatePos = this.updatePos.bind(this);
		this.setScrollEvent();
		
		
	}
	
	setScrollEvent()
	{
		window.addEventListener('scroll', this.updatePos);
	}
	
	
	updatePos()
	{
		if (window.scrollY != 0)
		{
			console.log("scrolled");
		}else{
			console.log("onTop");
		}
	}
	
	render(){
		return(
			<ul class="">
				<li class=""><a href="#">Home</a></li>
				<li class=""><a href="#">About</a></li>
				<li class=""><a href="#">Contact</a></li>
			</ul>
		);
	}
}



















window.onload = () => {
	if(window.screen.width < 950)
	{
		let initScale = window.screen.width/950;
		document.getElementsByName("viewport")[0].setAttribute('content','width=950, initial-scale='+ initScale +', maximum-scale=1.0, minimum-scale=0.25, user-scalable=yes');
	}
}

ReactDOM.render(
	<>
		<App/>
	</>,
  document.getElementById('root')
);

/*var nativeTextareaValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
function setValue (el, val) {
	return nativeTextareaValueSetter.call(el, val);
  }*/
/*<div class="row3">
				<div class="saveLabel">You can save your equation :</div>
			</div>
			<div class="row4">
				<textarea class="nameField" placeholder="Your equation name"></textarea>
				<div class="saveBtnWrapper"><button class="saveBtn" onClick={() => {this.saveEquation()}}>Save</button></div>
			</div>
			*/