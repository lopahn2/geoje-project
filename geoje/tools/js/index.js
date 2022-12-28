const checkpointDB = [];
const watchDB = [];
const patrolDB = [];

const color = (type) => {
	switch (type) {
		case "radar":
			return "colorName";
		case "fixedTOD":
			return "colorName";
		case "mobileTOD":
			return "colorName";
		case "coastCam":
			return "colorName";
		case "uav":
			return "colorName";
		case "seek":
			return "colorName";
		case "weak":
			return "colorName";
		case "mobilePatrol":
			return "colorName";
		case "reserve":
			return "colorName";
		case "active":
			return "colorName";
		case "armyshipDay":
			return "colorName";
		case "armyshipNight":
			return "colorName";
		case "navyship":
			return "colorName";
		case "coastShip":
			return "colorName";
		default:
			return "colorName";
	}
}

const findId = (type) => {
	switch (type) {
		case "radar":
			return "IdName";
		case "fixedTOD":
			return "IdName";
		case "mobileTOD":
			return "IdName";
		case "coastCam":
			return "IdName";
		case "uav":
			return "IdName";
		case "seek":
			return "IdName";
		case "weak":
			return "IdName";
		case "mobilePatrol":
			return "IdName";
		case "reserve":
			return "IdName";
		case "active":
			return "IdName";
		case "armyshipDay":
			return "IdName";
		case "armyshipNight":
			return "IdName";
		case "navyship":
			return "IdName";
		case "coastShip":
			return "IdName";
		default:
			return "IdName";
	}
}

const insertBtn = (e, siteNode, picNode) => {
	const container = document.querySelector(findId(e.type));
	const nodeBtn = document.createElement("button");
	nodeBtn.textContent = e.name;
	nodeBtn.addEventListener('click', (events) => {
		siteNode && siteNode.classList.toggle('display-none');
		picNode.classList.toggle('display-none');
		events.target.classList.toggle('clicked');
	});
	['mouseover', 'mouseout'].map((e) => {
		nodeBtn.addEventListener(e, () => {
			siteNode && siteNode.classList.toggle('div-mouse-on');
			picNode.classList.toggle('pic-mouse-on');
		});
	});
	container.append(nodeBtn);
}

const addList = (e) => {
	const [opName, opAgent] = [
		document.querySelector('#operation'),
		document.querySelector('#agent')
	];
	
	const listHolder = document.querySelector('#list-holder');
	const listComponent = document.createElement('div');
	const operationType = document.getelementsByName('operation-type');
	
	var [opTime, opPlace] = ['time in here', 'place name in here'];
	listComponent.innerHTML = `some html in here`;
	listComponent.classList.add('operation-contents');
	listHolder.append(listComponent);
	[opName.value, opTime, opPlace, opAgent.value] = ['','',''];
}

const borderBtn = document.querySelector('#btn-border');
borderBtn.addEventListener('click', () => {
	borderBtn.classList.toggle('cilcked');
	document.querySelector('#map-border').classList.toggle('display-none');
});

const checkPtBtn = document.querySelector('#btn-checkpoint');
borderBtn.addEventListener('click', () => {
	borderBtn.classList.toggle('cilcked');
	document.querySelector('#checkpoints').classList.toggle('display-none');
});

const escludeBtn = document.querySelector('#btn-exclude');
borderBtn.addEventListener('click', () => {
	borderBtn.classList.toggle('cilcked');
	document.querySelector('#map-exclude').classList.toggle('display-none');
});

checkpointDB.map((e, i) => {
	const parentNode = document.querySelector('#checkpoints');
	const modal = document.createElement('div');
	modal.classList.add('modal', 'display-none');
	modal.innerText = e.name;
	
	const node = document.createElement('div');
	node.setAttribute('id', `cp-${i}`);
	node.classList.add('checkpoint');
	node.innerText = e.name[0];
	node.style.top = (e.y - 13) + 'px';
	node.style.left = (e.x - 13) + 'px';
	node.addEventListener('mouseover', ()=> {
		modal.classList.toggle('display-none');
	});
	node.addEventListener('mouseout', ()=> {
		modal.classList.toggle('display-none');
	});
	
	node.append(modal);
	parentNode.append(node);
});

watchDB.map((e,i) => {
	const parentNode = document.querySelector('#watchpoints');
	
	const modal = document.createElement('div');
	modal.classList.add('modal', 'display-none');
	modal.innerText = e.name;
	
	const siteNode = document.createElement('div');
	siteNode.setAttribute('id', `${e.type}-site-${i}`);
	siteNode.classList.add(e.type, 'display-none');
	siteNode.innerText = (e.type === 'radar') ? "R" : (e.type === "fixedTOD" || e.type === "mobileTOD") ? "T" : "해";
	siteNode.style.top = (e.siteY - 13) + "px";
	siteNode.style.left = (e.siteX - 13) + "px";
	siteNode.addEventListener('mouseover', ()=> {
		modal.classList.toggle('display-none');
	});
	siteNode.addEventListener('mouseout', ()=> {
		modal.classList.toggle('display-none');
	});
	
	const picNode = document.createElement('div');
	picNode.setAttribute('id', `${e.type}-picture-${i}`);
	picNode.classList.add(color(e.type), 'display-none');
	picNode.style.width = e.picW + "px";
	picNode.style.height = e.picH + "px";
	picNode.style.backgroundImage = `url("` + e.picPath + `")`;
	picNode.style.position = 'absolute';
	picNode.style.top = e.picY + "px";
	picNode.style.left = e.picX + "px";
	picNode.addEventListener('mouseover', ()=> {
		modal.classList.toggle('display-none');
	});
	picNode.addEventListener('mouseout', ()=> {
		modal.classList.toggle('display-none');
	});
	
	siteNode.append(modal);
	parentNode.append(siteNode);
	parentNode.append(picNode);
	
	insertBtn(e, siteNode, picNode);
});

patrolDB.map((e, i) => {
	const parentNode = document.querySelector('#patrolpoints');
	
	const modal = document.createElement('div');
	modal.classList.add('modal', 'display-none');
	modal.style.filter = 'none';
	modal.style.top = e.picY + "px";
	modal.style.left = e.picX + "px";
	modal.innerText = e.name;
	
	const picNode = document.createElement('div');
	picNode.setAttribute('id', `${e.type}-${i}`);
	picNode.classList.add(color(e.type),'display-none');
	picNode.style.width = e.picW + 'px';
	picNode.style.height = e.picH + 'px';
	picNode.style.backgroundImage = `url("` + e.picPath + `")`;
	picNode.style.position = 'absolute';
	picNode.style.top = e.picY + "px";
	picNode.style.left = e.picX + "px";
	picNode.addEventListener('mouseover', ()=> {
		modal.classList.toggle('display-none');
	});
	picNode.addEventListener('mouseout', ()=> {
		modal.classList.toggle('display-none');
	});
	
	parentNode.append(modal);
	parentNode.append(picNode);
	insertBtn(e, null, picNode);
});

const boxStr = `[{"x":675,"y":801,"dx":34,"dy":31},{"x":675,"y":801,"dx":34,"dy":31},... 이런 식]`
const boxex = JSON.parse(boxStr);

const map = document.querySelector('#map');

var coord = null;

const insert = (idx, x, y, dx, dy) => {
	boxex.splice(idx,0,{x,y,dx,dy});
	render();
}

const cutoff = (idx) => {
	boxes.splice(idx, 1);
	render();
}

const save = () => {
	var data = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(boxes));
	var a = document.createElement('a');
	a.setAttribute('href', data);
	a.setAttribute('download', 'res.json');
	a.click();
}

const render = () => {
	Array.from(document.querySelectorAll('.temp')).map((e) => e.remove());
	Array.from(document.querySelectorAll('.boxes')).map((e) => e.remove());
	
	boxes.map((e, i) => {
		const part = document.createElement('div');
		part.setAttribute('id', `box${i}`);
		part.setAttribute('class','boxes');
		part.innerHTML = `< a style='postition: absolute;'>${i}</a>`;
		part.style.fontSize = '1px';
		part.style.color = 'white';
		part.style.overflow = 'hidden';
		part.style.width = e.dx + 'px';
		part.style.height = e.dy + 'px';
		part.style.left = e.x + 'px';
		part.style.top = e.y + 'px';
		part.style.zIndex = 100;
		part.style.position = 'absolute';
		part.style.backgroundColor = "rgba(0,0,0,0.4)";
		
		const img = document.createElement('img');
		img.src = "./img/border_all.png";
		img.style.marginLeft = '-' + e.x + 'px';
		img.style.marginTop = '-' + e.y + 'px';
		
		part.append(img);
		map.append(part);
	});
}

map.addEventListener('mousedown', (e) => {
	console.log(`MouseDown >> x: ${e.offsetX} y : ${e.offsetY}`);
	coord = {x:e.offsetX, y:e.offsetY};
});

map.addEventListener('mouseup', (e) => {
	const x = Math.min(coord.x, e.offsetX);
	const y = Math.min(coord.y, e.offsetY);
	const dx = Math.abs(coord.x - e.offsetX);
	const dy = Math.abs(coord.y - e.offsetY);
	boxes.push({x,y,dx,dy});
	render();
});

document.addEventListner('keydown', (e) => {
	if (e.key === "Enter" && boxes.length > 0) {
		cutoff(boxes.length - 1);
	} else if (e.key === "s") {
		var data = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(boxes));
		var a = document.createElement('a');
		a.setAttribute('href', data);
		a.setAttribute('download', 'res.json');
		a.click()
	}
});

render()