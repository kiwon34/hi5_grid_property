let gridObj, colEditor, gridEditor;
let gridOption = {
    locale: "ko",   // local 부분을 기본값을 국문

    width : '100%',
    height : '100%',
    headerRow : {
        autoRowHead : false,    // header 부분
        hwrap: false, //기본값 : true
        rowHtHead : 30,
        rowCount : 1,
        bgColor : '#999999'
    },
    bodyRow : {
        autoRow : false,        // contents 부분
        wrap: false,  //기본값: true
        rowHt: 30,
        rowCount : 1,
        bgColor : '#ffffff'
    },
    colCount : 3,
    minColWidth: 16,  // 기본값 50( flex모드 최소값)

    // 틀고정
    freezeCols: 0,
    freezeRows: 0,

    // 0번째 인덱스용 컬럼
    numberCell: {show: false},  // default : { width: 50, title: "", resizable: false, minWidth: 50, show: true }

    autoRowSum : false,     // 합계행 부분 - 합계행 사용시에만
    rowHtSum: 30,

    // Determines display of vertical borders of the columns.
    columnBorders: true,

    collapsible: {on: false, toggle: false},
    
    pageModel: { type: "" },

    //important option for this example.
    reactive: true,
    roundCorners: false,
    rowBorders: false,
    selectionModel: { type: 'cell' },
    stripeRows: false,
    scrollModel: {autoFit: false},
    showHeader: true,
    showTitle: false,
    showToolbar: false,
    showTop: false,

    autofill: false, // 기본값 : true-> false 변경 Drag 시에 자동으로 셀 정보가 복사 되는 현상 ( onStop 함수 )
    
    // 5.6.1 버전
    animModel: {
        on: true,
        events: "beforeSortDone",
        eventsH: ""
    },
    fillHandle: "",       //기본값 : ""
    formulasModel: { on: true },  // 5.6.1 버전 : 기본값: true
    loading: true,   // MDI 모드만 조회중 표시
    lastautofit : true,   // scrollModel autofit false인 경우 
    nofocus: false,  // fn.focus 함수
    layer: true,   // cCells속성 addBlock 함수

    flex: { on: true, one: true, all: true },  // 기본값 : {on: true, one: false, all: true}
    editable: false,
    collapsible: {
        on: false,
        toggle: true,
        collapsed: false,
        refreshAfterExpand: true,
        css: {
            zIndex: 1000
        }
    },
    filterModel: { on: false, newDI: [], smode: "AND", header: false, timeout: 400, type: 'local' },

    columnTemplate: {  align: "right", halign: "center" },
    
    editModel: {
        cellBorderWidth: 1,   // 기본값:0->1
        pressToEdit: true,
        clicksToEdit: 1,      // 체크박스만 존재하는 경우 때문에 Edit만 사용하는 경우에 화면에서 변경1값으로 변경을 한다.
        filterKeys: true,
        keyUpDown: true,
        reInt: /^([\-]?[1-9][0-9]*|[\-]?[0-9]?)$/,
        reFloat: /^[\-]?[0-9]*\.?[0-9]*$/,
        onBlur: "validate",
        saveKey: $.ui.keyCode.ENTER,
        onSave: "nextFocus",
        onTab: "nextFocus",
        allowInvalid: false,
        invalidClass: "pq-cell-red-tr pq-has-tooltip",
        warnClass: "pq-cell-blue-tr pq-has-tooltip",
        validate: true,
        charsAllow: ["0123456789.-=eE+", "0123456789-=eE+"]
    },
    mergeCells: [],
    sortModel: { cancel: true, ignoreCase: false, multiKey: 'shiftKey', number: true, on: false, single: true, sorter: [], space: false, type: 'local' },
    selectionModel: { all: true, row: false, type: "cell", mode: "block" }
}

let colModel = [
    { title : 'col1', dataIndx : "1" },
    { title : 'col2', dataIndx : "2", dataType : "integer" },
    { title : 'col3', dataIndx : "3", dataType : "float" }
]

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; //최댓값도 포함, 최솟값도 포함
}

function createTempData(){
    let data = [];
    let rowData = {};
    colModel.forEach(function(rd, idx){
        if(!rd.dataIndx) return;

        let value = "string";
        if(rd.dataType){
            switch(rd.dataType){
                case 'integer' : 
                    value = getRandomIntInclusive(0, 1000);
                    break;
                case 'float' :
                    if(rd.format){

                    }
                    else{
                        value = 9.3999;
                    }
                    break;
                case 'html':
                    value = "<div>HTML text</div>";
                    break;
                case 'bool':
                    value = true;
                    break;
                default:
                    break;
            }
        }
        rowData[rd.dataIndx] = value;
    });
    data.push(rowData);

    return data;
}

$(function () {
    // create the editor
    var container = document.getElementById("jsoneditor");
    var options = {};
    gridEditor = new JSONEditor(container, options);

    gridEditor.set(gridOption);

    container = document.getElementById("columneditor");
    options = {};
    colEditor = new JSONEditor(container, options);

    colEditor.set(gridOption);

    var data = createTempData();

    let obj = {};
    $.extend( true, obj, gridOption );

    obj.dataModel = { data : data };
    // row 선택모드인 경우 변경시 발생되는 이벤트 함수
    obj.rowSelect = function (evt, ui) {
        console.log('rowSelect', ui);
    };
    obj.selectChange = function (evt, ui) {
        console.log('selectChange==>', ui);
        let address = ui.selection.address();
    };
    obj.check = function(e, ui){
        if ( ui.source == "header") return;

        console.log("check====>", ui );
        let _dataIndx = ui.dataIndx == "ProductName"? "chk": ui.dataIndx,  // 숨긴체크박스 아이템명으로 변경 
            _check    = ui.check,
            that = this, // 그리드 객체
            items =["check","state", "chk"]; // 3개 컬럼 동기화 처리
        
        // 대상외 항목아이템을 취득한다.
        let _rows = ui.rows,_rowData; 
        arItems = items.filter( function(item){
             if(item != _dataIndx) return item;
        });

        // 각 체크데이터 반대값으로 지정( item->데이터 순으로 변경)
        let changedItems = arItems.filter ( function(item){
          // 변경된 아이템 정보가 있으면 아이템명을 반환한다.
          let count = _rows.filter ( function( rd ){
              // Editable false 이면 값을 변경 해서는 안된다.
              let ui = {dataIndx: item,        // 데이터  아이템
                        rowIndx : rd.rowIndx,  // 행 위치
                        rowData:  rd.rowData    // 원본 레코드 데이터 
                      };
              //  열, 행 단위순으로 활성화 여부를 체크한다.        
              if ( that.isEditable ( ui ) !== false ){
                  rd.rowData[item] = _check ? false : false;
                  return true;  
              }
          });
          if ( count.length > 0 ) return item;
        });

        // 변경된 체크 컬럼의 UI 및 헤더 정보갱신한다.
        changedItems.forEach( function(item){
              let iCheckBox = that.Checkbox(item);
              iCheckBox && iCheckBox.onDataReady();
        });
    };
    obj.allEvents = function (e, ui){
        let self = this, o = self.options, type = e && e.type ? e.type.split(':')[1] : "";
        if ( o.debug )
            console.log("allEvents-->", type, ui);
    };
    obj.contextMenu = {
        on: true,
        //callback used to create dynamic menu.
        items: function (evt, ui) {
            console.log(ui);
            if(ui.type == "head"){
                return headItems.call(this, evt, ui);
            }
            else
                return bodyItems.call(this, evt, ui);
        }
    };
    obj.cellClick = function( event, ui ){
        let colIdx = ui.colIndx;
        let CM = this.getColModel( );
        
        let CM_idx = CM[colIdx];
        colEditor.set(CM_idx);
    };

    gridObj = pq.grid("#grid_content", obj);

    function _action ( ui, item ){
        debugger;
        console.log(ui, item);
        let grid = this, key = item.name,  rowIndx =  ui.rowIndx,
            enable = true, rowData = ui.rowData,
            dataIndx = ui.column.dataIndx,
            column = ui.column,
            that = this;

        if(key == "Title Rename"){
            var title = column.title;
            title = prompt("Enter new column title", title);
            if (title) {
                grid.Columns().alter(function () {
                    column.title = title;
                });
            }
        }
        // --> [START] 수정자: Kim changeha 수정일자:2020:09:23
        //수정내용> {task3}:[기능추가] 체크박스 관련 기능 추가
        // 5) 각셀의 체크상태값을 취득하는 신규함수
        // ui ={rowIndx:rowIndx }    
        if ( key == "CheckBox변경"){
            debugger;
            let iCheckBox = that.Checkbox( dataIndx ); 
            if ( iCheckBox ){
                // 현재 체크상태를 취득한다.
                let _check = iCheckBox.getCheckStatus ( {rowIndx:rowIndx});
                // 선택한 체크박스 토클 시킨다.
                iCheckBox.checkNodes([rowData], !_check);  // 이벤트 발생
            }
            return;
        }
        //<-- [End]

        // 행활성화, 행비활성화
        if ( key == "행비활성화"){
            enable = false;
        };
        //let pq_rowprop = rowData.pq_rowprop = (rowData.pq_rowprop || {});  
        //pq_rowprop.edit = enable;
        //grid.refreshRow( {rowIndx:rowIndx} );
        grid.refresh( );
        // pq_rowprop.edit

    }
    function headItems(evt, _ui) {
        let dataIndx = _ui.dataIndx;
        return [
            {
                name: 'Title Rename',
                action: function (evt, ui, item) {
                    _action.call ( this, ui, item );
                }
            },
            {
                name: 'Insert Column',
                action: function (evt, ui, item) {
                    _action.call ( this, ui, item );
                }
            },
            {
                name: 'Remove Column',
                action: function (evt, ui, item) {
                    _action.call ( this, ui, item );
                }
            },
            {
                name: 'Hide Column',
                action: function (evt, ui, item) {
                    _action.call ( this, ui, item );
                }
            }
        ];
    }
    //provides menu items for body cells.
    function bodyItems(evt, _ui) {
        let dataIndx = _ui.dataIndx;
        return [
            {
                name: 'Insert Column',
                action: function (evt, ui, item) {
                    _action.call ( this, ui, item );
                }
            },
            {
                name: 'Remove Column',
                action: function (evt, ui, item) {
                    _action.call ( this, ui, item );
                }
            },
            {
                name: 'Hide Column',
                action: function (evt, ui, item) {
                    _action.call ( this, ui, item );
                }
            },
            {
                name: '행단위 제어',
                subItems: [
                    {
                        name: '행활성화',
                        action: function (evt, ui, item) {
                            _action.call ( this, ui, item );
                        }
                    },
                    {
                        name: '행비활성화',
                        action: function (evt, ui, item) {
                            _action.call ( this, ui, item );
                        }
                    },
                    {
                        name: '컬럼변경',
                        action: function (evt, ui, item) {
                            _action.call ( this, ui, item );
                        }
                    }

                ]
            },
            {
        // --> [START] 수정자: Kim changeha 수정일자:2020:09:24
        //수정내용> {task3}:[기능추가] 체크박스 관련 기능 추가
        // 5) 각셀의 체크상태값을 취득하는 신규함수
                name: "CheckBox변경",
                tooltip : "checkbox 셀이 존재하는 경우만 활성화<BR>체크상태를 토글하는 기능 ", 
                disabled: this.Checkbox( dataIndx ) ? false : true,  // 체크박스 컬럼여부 판단
                action: function (evt, ui,item) {
                    _action.call ( this, ui, item );
                }
        //<-- [End]
        },        
        
        {
            name: '병합',
            subItems: [
                        { name: 'Merge cells',
                            action: function (evt, ui) {
                                debugger;
                                this.Selection().merge();
                            }
                        },
                        { name: 'Unmerge cells',
                            action: function (evt, ui) {
                                debugger;
                                this.Selection().unmerge();
                            }
                        },        
                    ]
        },
        'separator',
        {
            name: 'Export',
            subItems: [
                {
                    name: 'csv',
                    action: function () {
                        exportData.call(this, 'csv');
                    }
                },
                {
                    name: 'html',
                    action: function () {
                        exportData.call(this, 'html');
                    }
                },
                {
                    name: 'json',
                    action: function () {
                        exportData.call(this, 'json');
                    }
                },
                {
                    name: 'xlsx',
                    action: function () {
                        exportData.call(this, 'xlsx');
                    }
                }
            ]
        },
        {
            name: "Redo",
            icon: 'ui-icon ui-icon-arrowrefresh-1-s',
            disabled: !this.History().canRedo(),
            action: function (evt, ui) {
                //debugger;
                this.History().redo();
            }
        },
        'separator',
        {
            name: "Copy",
            icon: 'ui-icon ui-icon-copy',
            shortcut: 'Ctrl - C',
            tooltip: "Works only for copy / paste within the same grid",
            action: function (evt, ui) {
                debugger;
    // --> [START] 수정자: Kim changeha 수정일자:2020:09:22
    //수정내용> {task2}: [기능추가]팝업메뉴 또는 외부함수로 복사기능 ( ctl+c )기능 제외
                // ui={$td:$td...}
                //console.log(ui);                
                this.exportCopy ( ui ); // ctl+c 단축키를 사용하지 않는 경우
                // return this.copy();   //그리드 내 복사후 같은 그리드내 붙여넣기 기능
    //<-- [End]  
            }
        },
        {
            name: "Paste",
            icon: 'ui-icon ui-icon-clipboard',
            shortcut: 'Ctrl - V',
            //disabled: !this.canPaste(),
            action: function () {
                this.paste();
                //this.clearPaste();
            }
        }
    ]
    };
});