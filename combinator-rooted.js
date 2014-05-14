/**
	Combinator-rooted selector 를 사용 할 수 있도록 해주는 패치

	예시 코드 :

		document.body.querySelector('> div').querySelector('+ span').querySelectorAll('~ span'); // 사용불가

		var p = document.createElement('p');
		p.innerHTML = '<span>hello</span><strong>world</strong>';
		p.querySelector('> span').querySelectorAll('~ *');
**/
(function () {

	var expandQuerySelector = function(methodName) {

		// 메소드가 아예 없는 상태면 패치 진행 안함
		if (!HTMLElement.prototype[methodName]) { return; }

		var MAGICKEY = 'QS' + new Date().getTime();

		// 부모노드가 없는 엘리먼트에서 찾을때 적용할 임시 부모
		var fragment = document.createDocumentFragment();

		// 원래 메서드 보관
		var queryOrg = HTMLElement.prototype[methodName];

		HTMLElement.prototype[methodName] = function(selector) {

			// > + ~ 로 시작하지 않는 셀렉터면 그냥 원래 메서드로 수행
			if (!/^\s*[>\+~]/.test(selector)) {
				return queryOrg.apply(this, arguments);
			}

			var startNode;

			if (this.parentNode) { // 부모노드가 있으면
				startNode = this.parentNode;
			} else { // 부모노드가 없으면 임시부모 지정
				startNode = fragment;
				fragment.innerHTML = '';
				fragment.appendChild(this);
			}

			if (this.id) { // ID 가 있으면 아이디를 기준으로 찾게 함
				return startNode[methodName]('#' + this.id + selector);
			}

			// ID 가 없으면 임시 속성을 지정해서 그걸로 찾은 후, 속성을 지움
			try {
				this.setAttribute(MAGICKEY, true);
				return startNode[methodName](this.tagName + '[' + MAGICKEY + ']' + selector);
			} finally {
				this.removeAttribute(MAGICKEY);
			}

		};

	};

	// querySelector 와 querySelectorAll 두개에 대해서 기능 확장 진행
	expandQuerySelector('querySelector');
	expandQuerySelector('querySelectorAll');

})();

// console.log(document.body.querySelector('> div'));

// var foo = document.createElement('div');
// foo.innerHTML = '<span>hello</span><strong>world</strong>';

// foo.querySelector('> span').querySelector('~ strong');
