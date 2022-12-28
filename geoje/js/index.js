// coastLine : 해안선 조각의 정보(x, y, dx, dy)
const coastLineStr = `[{"x":675,"y":801,"dx":34,"dy":31},{"x":625,"y":811,"dx":37,"dy":11}]`;
const coastLine = JSON.parse(coastLineStr);

const numGenerator = (start, end) => {
	let temp = [];
	for (let i = start; i < end + 1; i++) {
		temp.push(i);
	}
	return temp;
};


// partitionDB : 작전 지역을 나타내는 해안선 조각 번호 목록
const partitionDB = [
	{
		type: "작전의 종류",
		name: "작전명",
		time: ["00:00", "23:59"],
		range: ["a","b","c","..."], // 감시 범위를 나타내는 해안선 조각 번호
		places: ["매복지A", "매복지B","..."] // intervals[i]의 지역이름이 range[i]이며 만약 interval이 정의 되어있는데 places가 undefined이면 getScape함수로 확인
	}
];

const centralCCTVDB = [
	{
		x: 1090,
		y: 653
	},
	{
		x: 1022,
		y: 333
	}
];


// harborNumbers : 항포구를 나타내는 해안선 조각 번호 목록
const harborNumbers = [
	0,3,4,5,10,92
]

// harborName : harborNumbers에 대응하는 항구 이름
const harborNames = [
	'홍길동항', '김자겸항', '그럼안되항', '포항항', '크항항'
]

// nameDB : 각 해안선 조각에 대응되는 이름
const nameDB = [
	'홍길동항', '김자겸항A', '김자겸항B', '그럼안되항A', '...'
]

// operationDB : 현재까지 진행한 작전들의 목록
var operationDB = []

/* Data pre-processing */
const operationTypes = [...new Set(partitionDB.map(e => e.type))];
const operationNames = partitionDB.map(e => e.name);
const filterList = Array(partitionDB.length).fill(true);

/* Bind tags with JS object */

const map = document.querySelector('#map');
const leftNav = document.querySelector('#left-nav');
const rightNav = document.querySelector('#right-nav');
const operationContainer = document.querySelector('#operation-container');
const startTimeFilter = document.querySelector('#start-time-filter');
const harborBtn = document.querySelector('#harbor-btn');
const cctvBtn = document.querySelector('#cctv-btn');
const endTimeFilter = document.querySelector('#end-time-filter');
const setFilterBtn = document.querySelector('#render-with-filter');
const initFilterBtn = document.querySelector('#init-filter');
const opTypeInput = document.querySelector('#op-type');
const opNameInput = document.querySelector('#op-name');
const placeListInput = document.querySelector('#place-list');
const startTimeInput = document.querySelector('#input-start-time');
const endTimeInput = document.querySelector('#input-end-time');
const agentInput = document.querySelector('#agent-input');
const opSaveBtn = document.querySelector('#op-save-btn');

startTimeInput.value = new Date().toISOString().substring(0,10).replaceAll('-','.') + ' 00:00';
endTimeInput.value = new Date().toISOString().substring(0,10).replaceAll('-','.') + ' 23:59';

/* operation modal on off function */
const opCreateOpenBtn = document.querySelector('#op-create-open-btn');
const opCreateModal = document.querySelector('#op-create-modal');
const opCloseBtn = document.querySelector("#op-close-btn");

opCreateOpenBtn.addEventListener('click', (e) => {
	opCreateModal.classList.remove('display-none');
});

opCloseBtn.addEventListener('click', (e) => {
	opCreateModal.classList.add('display-none');
});

/* File I/O */
const fileLoader = document.createElement(input);
fileLoader.setAttribute('id','file-loader');
fileLoader.setAttribute('type', 'file');
fileLoader.setAttribute('accept','.json');
fileLoader.addEventListener('change', (e) => {
	const file = e.target.files[0];
	if (file) {
		var reader = new FileReader();
		reader.onload = ((e) => {
			JSON.parse(e.target.result).forEach((op) => addOperation(op));
			render(operationDB);
		});
		reader.readAsText(e.target.files[0]);
	}
});

const downloadBtn = document.querySelector('#file-saver');
downloadBtn.addEventListener('click', (e) => {
	var dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(operationDB));
	var a = document.createElement('a');
	a.setAttribute('href', dataStr);
	a.setATtribute('download', `${new Date().toISOString().subString(0,10)}.json`);
	a.click();
});

/* Helper functions */
// isPlaceNeeded : 감시작전이면 false, 순찰작전이면 true
const isPlaceNeeded = (type) => !operationTypes.slice(0,5).includes(type);

// getOpTime : 작전 시간이 다음날로 넘어가는 경우를 포함해서 시간 구하기
const getOpTime = (timeList) => {
	const day = new Date();
	const [h0, m0, h1, m1] = [...timeList[0].split(':'), ...timeList[1].split(':')].map((s) => parseInt(s));
	if ((h0 < h1) || (h0 === h1 && m0 <= m1)) {
		const res = [h0, m0, h1, m1].map((i) => i + '').map((s) => s.length === 1 ? '0' + s : s);
		return [`${day.getFullYear()}.${day.getMonth() + 1}.${day.getDate()} ${res[0]}:${res[1]}`,`${day.getFullYear()}.${day.getMonth() + 1}.${day.getDate()} ${res[2]}:${res[3]}`]
	} else {
		const res = [h0, m0, h1, m1].map((i) => i + '').map((s) => s.length === 1 ? '0' + s : s);
		const nextDay = new Date();
		nextDay.setDate(day.getDate() + 1);
		return [`${day.getFullYear()}.${day.getMonth() + 1}.${day.getDate()} ${res[0]}:${res[1]}`,`${day.getFullYear()}.${day.getMonth() + 1}.${day.getDate()} ${res[2]}:${res[3]}`]
	}
}

// getScape : 해안선 조각 번호를 받아 절벽, 지역, 해안선을 구분하는 함수
const getScape = (num) => {
	const harborIdx = harberNumbers.indexOf(num);
	if (harborIdx !== -1) {
		return harborNames[harborIdx]
	} else {
		return nameDB[num]
	}
}

// getSeen : operationDB의 내용으로 해안선 조각들이 확인된 횟수를 나타내는 함수
const getSeen = (opDB) => {
	const seenList = Array(coastLine.length).fill([]);
	opDB.forEach((op) => {
		const operation = partitionDB[partitionDB.map((o) => o.name).indexOf(op.name)];
		let range = [];
		if (op.type === '순찰-수색') {
			range = op.range;
		} else if ('places' in op) {
			range = op.places.map((e) => {
				const idx = ('places' in operation ? operation.places : operation.range.map((i) => getScape(i))).indexOf(e);
				return operation.range[idx];
			});
		} else {
			range = operation.range;
		}
		
		range.forEach((i) => {
			seenList[i] = seenList[i].concat({...op, range: range});
			seenList[i] = Array.from(new Set(seenList[i].map(JSON.stringify))).map(JSON.parse);
		})
		
	});
	return seenList;
}

// addOperation : operationDB에 작전 추가 후 정렬 및 중복 원소 제거
const addOperation  = (op) => {
	// operationDB 최신화
	const operation = partitionDB[partitionDB.map((o) => o.name).indexOf(op.name)];
	let range = [];
	if ('places' in op && operation.type === '순찰-수색') {
		const start = harborNames[harborNames.indexOf(op.places[0])];
		const end = harborNames[harborNames.indexOf(op.places[1])];
		range = Array(Math.abs(end-start)+1).fill().map((e,i) => start + i);
	} else if ('places' in op) {
		range = op.places.map((e) => {
			const idx = ('places' in operation ? operation.places : operation.range.map((i) => getScape(i))).indexOf(e);
			return operation.range[idx]
		});
	} else {
		range = operation.range;
	}
	operationDB.push({...op, range: range});
	operationDB.sort((x,y) => x.time[0] < y.time[0] ? 1 : (x.time[0]===y.time[0]) ? 0 : -1);
	operationDB = Array.from(new Set(operationDB.map(JSON.stringify)).map(JSON.parse))				
}

// deleteOperation : operationDB에서 작전 삭제
const deleteOperation = (idx) => {
	const op = operationDB[idx];
	operationDB.slice(idx, 1);
}

// render : operationDB의 내용 중 필터로 설정한 원하는 값을 rightNav에 도식하는 함수
const render = (opDB) => {
	const opFilter = operationNames.filter((e,i) => {
		return Array.from(document.querySelector(`#op-idx-${i}`).classList).includes('checked');
	});
	opDB = opDB.filter((e) => {opFilter.includes(e.name)});
	const timeFilter = [startTimeFilter.value.trim(), endTimeFilter.value.trim()].map((e) => new Date(e).getTime());
	if (!isNaN(timeFilter[0]) && !isNaN(timeFilter[1])) {
		const hasIntersects = (a, b, c, d) => {
			return !((a > c && a > d) || ( b < c && b < d));
		}
		opDB = opDB.filter((e) => hasIntersects(timeFilter[0], timeFilter[1], new Date(e.time[0]).getTime(), new Date(e.time[1]).getTime()));
	}
}

// HTML 
const seenList = getSeen(opDB);
rightNav.innerHTML = ``;
rightNav.append(fileLoader);
rightNav.append(downloadBtn);

// rendering to map
coastLine.map((e,i) => {
	document.querySelector(`#coast-line-${i}`).setAttribute('class', 'coast-line');
	let classList = ['a-red'];
	getScape(i) === '절벽' && classList.push('b-grey');
	seenList[i].map((e) => {
		if (e.type === '순찰-수색') {
			classList.push('c-black');
		} else if (!isPlaceNeeded(e.type)) {
			classList.push('d-blue');
		} else {
			classList.push('e-limegreen');
		}
	});
	classList = [...new Set(classList)].sort();
	classList.map((e) => {
		document.querySelector(`coast-line-${i}`).classList.add(e);
	});
	const part = document.querySelector(`#coast-line-${i}`);
	part.addEventListener('click', () => {
		const modal = document.querySelector(`#modal-${i}`);
		let seenInfoHTML = `${seenList[i].length}번 감시 <br>`;
		seenList[i].forEach((op, n) => {
			seenInfoHTML += `${n+1}.${op.type}&nbsp;&nbsp;|&nbsp;&nbsp;${op.name}<br>`;
		});
		modal.innerHTML = getScape(i) + '<br>' + seenInfoHTML;
		modal.classList.remove('display-none');
	});
});

// rightNav에 작전 추가
opDB.forEach((op, i) => {
	const node = document.createElement('div');
	node.setAttribute('id', `ops-${i}`);
	node.classList.add('operation-cards');
	if ('places' in op) {
		node.innerHTML += `context`;
	} else {
		node.innerHTMLr += `context`;
	}
	
	node.addEventListener('mouseover', (e) => {
		op.range.forEach((r) => {
			document.querySelector(`#coast-line-${r}`).classList.add('yellow');
		});
	});
	
	node.addEventListener('mouseout', (e) => {
		op.range.forEach((r) => {
			document.querySelector(`#coast-line-${r}`).classList.remove('yellow');
		});
	});
	
	node.querySelector('button').addEventListener('click', (e) => {
		op.range.forEach((r) => {
			document.querySelector(`#coast-line-${r}`).classList.remove('yellow');
		});
		
		const idx = node.id.split('-')[node.id.split('-').length -1];
		deleteOperation(idx);
		render(operationDB);
	});
	
	rightNav.append(node);
});

/* Web App Behavior */

document.zoom = "75%";
map.style.zoom = "75%";
document.addEventListener('keydown', (e) => {
	if (e.key === 'w') {
		const zoom = map.style.zoom;
		map.style.zoom = parseInt(zoom.substring(0, zoom.length - 1)) + 5 + "%";
	} else if (e.key === 's') {
		const zoom = map.style.zoom;
		map.style.zoom = Math.max(parseInt(zoom.substring(0, zoom.length - 1)) -5 , 50) + "%";
	} else if (e.key === 'Escape') {
		leftNav.classList.toggle('display-none');
		rightNav.classList.toggle('display-none');
	}
});

centralCCTVDB.forEach((e) => {
	const node = document.createElement('div');
	node.classList.add('cctv-container');
	node.textContent = "cctv";
	node.style.position = "absolute";
	node.style.top = e.y + 'px';
	node.style.left = e.x + 'px';
	map.append(node);
});

coastLine.forEach((e, i) => {
	const modal = document.createElement('div');
	modal.setAttribute('id', `modal-${i}`);
	modal.classList.add('modal', 'display-none');
	modal.style.left = e.x + 'px';
	modal.style.top = e.y + 'px';
	
	const part = document.createElement('div');
	part.setAttribute('id', `coast-line-${i}`);
	part.setAttribute('class', `coast-line`);
	part.style.width = e.dx + 'px';
	part.style.height = e.dy + 'px';
	part.style.top = e.y + 'px';
	part.style.left = e.x + 'px';
	
	const img = document.createElement('img');
	img.src = './img/coast-line.png';
	img.style.marginLeft = '-' + e.x + 'px';
	img.style.marginTop = '-' + e.y + 'px';
	
	if (getScape(i)[getScape(i).length - 1] === '항') {
		const node = document.createElement('div');
		const textTag = document.createElement('div');
		
		node.classList.add('harbor-container');
		textTag.classList.add('text-tag');
		textTag.textContext = getScape(i);
		node.append(textTag);
		node.style.position = 'absolute';
		
		node.style.top = coastLine[i].y + 10 + 'px';
		node.style.left = coastLine[i].x + 'px';
		map.append(node);
	}
	
	part.addEventListener('mouseover', (e) => {
		part.classList.toggle('yellow');
	});
	part.addEventListener('mouseout', (e) => {
		part.classList.toggle('yellow');
	});
	part.addEventListener('click', (e) => {
		modal.innerHTML = getScape(i) + "<br>" + `해당 기간 동안 0번 감시`;
		modal.classList.remove('display-none');
	});
	
	modal.addEventListener('click', () => modal.classList.add('display-none'));
	
	part.append(img);
	map.append(modal);
	map.append(part);
});

// 작전 목록 가져오기
operationTypes.forEach((e) => {
	const opType = document.createElement('div');
	opType.classList.add('operation-contents');
	opType.innerHTML = 'context';
	operationContainer.append(opType);
	
	const opSelect = document.createElement('option');
	opSelect.innerText = e;
	opTypeInput.append(opSelect);
});

harborBtn.addEventListener('click', (e) => {
	harborBtn.classList.toggle('checked');
	document.querySelectorAll('.harbor-container').forEach((e) => {
		e.classList.toggle('dispaly-none')
	});
});

cctvBtn.addEventListener('click', (e) => {
	cctvBtn.classList.toggle('checked');
	document.querySelectorAll('.cctv-container').forEach((e) => {
		e.classList.toggle('display-none');
	});
});

partitionDB.forEach((e,i) => {
	const operation = document.createElement('div');
	operation.setAttribute('id', `op-idx-${i}`);
	operation.classList.add('operation-filter', 'checked');
	operation.innerText = e.name;
	
	operation.addEventListener('mouseover', () => {
		e.range.forEach((r) => {
			document.querySelector(`#coast-line-${r}`).classList.toggle('yellow');
		});
	});
	operation.addEventListener('mouseout', () => {
		e.range.forEach((r) => {
			document.querySelector(`#coast-line-${r}`).classList.toggle('yellow');
		});
	});
	operation.addEventListener('click', () => {
		operation.classList.toggle('checked');
		const idx = parseInt(operation.id.split('-')[operation.id.split('-').length - 1]);
		filterList[idx] = !filterList[idx];
	});
	document.querySelector(`#op-type-${e.type.replace(/ /gi,'')}`).append(operation);
	
});

// 필터설정

setFilterBtn.addEventListener('click', (e) => render(operationDB));
initFilterBtn.addEventListener('click', (e) => {
	harborBtn.classList.add('checked');
	
	document.querySelectorAll('.harbor-container').forEach((e) => {
		e.classList.remove('display-none');
	});
	
	cctvBtn.classList.add('checked');
	
	document.querySelectorAll('.cctv-container').forEach((e) => {
		e.classList.remove('display-none');
	});
	
	operationNames.forEach((e, i) => {
		document.querySelector(`#op-idx-${i}`).classList.add('checked');
	});
	[startTimeFilter.value, endTimeFilter.value] = ['',''];
	render(operationDB);
});

// 작전 입력란
opTypeInput.addEventListener('change', (e) => {
	opNameInput.innerHTML = `<option value=''>작전선택</option>`;
	if (e.target.value !== '') {
		opNameInput.disabled = false;
		partitionDB.filter((op) => op.type === e.target.value).forEach((op) => opNameInput.innerHTML += `<option>${op.name}</option>`);
	} else {
		opNameInput.disabled = true;
	}
});

opNameInput.addEventListener('change', (e) => {
	placeListInput.innerHTML = '';
	if (e.target.value !== '') {
		const operation = partitionDB[partitionDB.map((op) => op.name).indexOf(e.target.value)];
		if ('time' in operation) {
			[startTimeInput.value, endTimeInput.value] = getOpTime(operation.time);
		}
		isPlaceNeeded(opTypeInput.value) ? placeListInput.classList.remove('display-none') : placeListInput.classList.add('display-none');
		const places = 'places' in operation ? operation.places : operation.range.map(getScape);
		if (opTypeInput.value === '순찰-수색') {
			placeListInput.innerHTML = `context`;
			harborNames.map((e) => {
				const node1 = document.createElement('option');
				node1.textContext = e;
				document.querySelector('#start-harbor').append(node1);
				
				const node2 = document.createElement('option');
				node2.textContext = e;
				document.querySelector('#end-harbor').append(node2);
			});
		} else {
			place.forEach((p) => {
				placeListInput.innerHTML += `<span><input id='place-list-checkbox' type='checkbox' checked>${p}</input></span>`;
			});
		}
	}
});

opSaveBtn.addEventListener('click', (e) => {
	if (opNameInput.value === '' || startTimeInput.value === '' || endTimeInput.value === '') {
		return alter('작전 종류/작전 이름/시간/장소를 입력하십시오.');
	}
	
	if (isNaN(new Date(startTimeInput.value.trim()).getTime()) || isNaN(new Date(endTimeInput.value.trim()).getTime())) {
		return alter('시간 값을 정확한 형식으로 입력하십시오.');
	}
	
	if (opTypeInput.value === '순찰-수색') {
		const places = [document.querySelector('#start-harbor').value, document.querySelector('#end-harbor').value];
		if (places[0] === '' || places[1] ==='') {
			return alter('시작/도착 항구를 체크해주세요');
		}
		
		addOperation({
			type : opTypeInput.value,
			name : opNameInput.value,
			time : [startTimeInput.value, endTimeInput.value],
			places : places,
			agent : agentInput.value
		});
	} else if (isPlaceNeeded(opTypeInput.value)) {
		const places = Array.from(placeListInput.querySelectorAll('span')).filter((e) => e.querySelector('input').checked).map((e) => e.textContext);
		if (places.length === 0) {
			return alter('하나 이상의 세부 장소를 체크하세요');
		}
		
		addOperation({
			type : opTypeInput.value,
			name : opNameInput.value,
			time : [startTimeInput.value, endTimeInput.value],
			places : places,
			agent : agentInput.value
		});
	} else {
		addOperation({
			type : opTypeInput.value,
			name : opNameInput.value,
			time : [startTimeInput.value, endTimeInput.value],
			places : places,
			agent : agentInput.value
		});
	}
	
	const today = new Date().toISOString().substring(0,10).replaceAll('-','.');
	[opTypeInput.value, opNameInput.value, startTimeInput.value, endTimeInput.value, agentInput.value] = ['','', today + ' 00:00', today + ' 23:59'];
	alter('작전 추가 완료');
	render(operationDB);
});

const dragElement = (el) => {
	let pos1 = 0;
	let pos2 = 0;
	let pos3 = 0;
	let pos4 = 0;
	
	el.onmousedown = dragMouseDown;
	function dragMouseDown(e) {
		e = e || window.event;
		
		pos3 = e.clientX;
		pos4 = e.clientY;
		document.onmouseup = closeDragElement;
		document.onmousemove = elementDrag;
	}
	
	function elementDrag(e) {
		e = e || window.event;
		
		pos1 = pos3 - e.clientX;
		pos2 = pos4 - e.clinetY;
		pos3 = e.clientX;
		pos4 = e.clientY;
		el.style.top = (el.offsetTop - pos2) + 'px';
		el.style.left = (el.offsetTop - pos1) + 'px';
	}
	
	function closeDragElement() {
		document.onmouseup = null;
		document.onmousemove = null;
	}
}

dragElement(opCreateModal);

render(operationDB);