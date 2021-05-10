// LINE Notifyでトークルームのトークンを取得して以下に設定★
var LINE_NOTIFY_TOKEN = PropertiesService.getScriptProperties().getProperty('LINE_NOTIFY_TOKEN');
var NOTIFY_API = "https://notify-api.line.me/api/notify";

// 書籍検索WebAPI(楽天WebAPI)
var APP_ID = PropertiesService.getScriptProperties().getProperty('APP_ID');
var SEARCH_BASE_URL = "https://app.rakuten.co.jp/services/api/BooksTotal/Search/20170404"
                        + "?elements=itemUrl,title,salesDate,isbn"
                        + "&formatVersion=2"
                        + "&sort=-releaseDate"
                        + "&booksGenreId=001"
                        + "&orFlag=1"
                        + "&format=json"
//                        + "&callback=JSON_CALLBACK"
                        + "&applicationId=" + APP_ID
                        + "&keyword=";

// TODO:スクリプトプロパティから取得するように修正予定
var bookNames = [
  "ONEPIECE"
  , "ブラッククローバー"
//  , "BEGIN"
//  , "マリーミー"
  , "宇宙兄弟"
  , "ケンガンオメガ"
//  , "ケンガンアシュラ"
  , "東京卍リベンジャーズ"
  , "ダンジョン飯"
//  , "SEVEN☆STAR"
  , "セブン☆スター"
  , "ワンパンマン"
  , "東京喰種"
  , "フルアヘッド!ココ"
  , "青の祓魔師"
  , "Re:Monster"
  , "海王ダンテ"
//  , "忍法魔界転生"
  , "銀狼ブラッドボーン"
  , "ノー・ガンズ・ライフ"
  , "ジョジョリオン"
  , "バイオレンスアクション"
  , "テラフォーマーズ"
  , "ドリフターズ"
  , "GANGSTA."
  , "風都探偵"
  , "終末のワルキューレ"
  , "信長を殺した男"
  , "仮面ライダークウガ"
  , "惰性67パーセント"
  , "爆音列島"
//  , "地雷震"
  , "WORST"
  , "無限の住人"
  , "前田慶次"
  , "池袋ウエストゲートパーク"
];

function searchBooks() {
  var keyParams = [];
  var keyParam = "";
  
  for (var i = 0; i < bookNames.length; i++) {
    if (strLenJ(keyParam + bookNames[i]) > 60) {
      keyParams.push(keyParam);
      keyParam = "";
    }
    keyParam += bookNames[i] + " ";
  }
  keyParams.push(keyParam);

  var date = new Date();
  var today = Utilities.formatDate(date, 'Asia/Tokyo', 'yyyyMMdd');
//  today = "20180511";

// Logger.log(today);

  var bodyItem = [];

  for (var j = 0; j < keyParams.length; j++) {
    var response = UrlFetchApp.fetch(SEARCH_BASE_URL + keyParams[j]);
    var json = JSON.parse(response.getContentText());

    for (var jj = 0; jj < json.Items.length; jj++) {
      var salesDate = json.Items[jj].salesDate.replace("年", "").replace("月", "").replace("日", "").replace("頃", "");

      if (salesDate.length == 8 && salesDate == today) {
        bodyItem.push(json.Items[jj].title);
        bodyItem.push(createBooklogURL(json.Items[jj].isbn.toString().substr(3, 9)));
      }
    }

    // Logger.log(json);
    sleep(1000);
  }

  // メッセージ送信
  if (bodyItem.length > 0) {
    // LINEに送信 --- (*3)
    _sendMessage(bodyItem.join("\n"));
  }
}

// スタンプを送信する
function _sendMessage(msg) {
  // 認証情報のセット
  var headers = {
    "Authorization": "Bearer " + LINE_NOTIFY_TOKEN
  };
  // メッセージをセット
  var payload = {
    "message": "\n" + msg
  };
  // 送信情報をまとめる
  var options = {
    'method' : 'post',
    'contentType' : 'application/x-www-form-urlencoded',
    'headers': headers,
    'payload' : payload
  };
  // Logger.log(options);
  // 実際に送信する
  var response = UrlFetchApp.fetch(NOTIFY_API, options);
  // Logger.log(response);
}

function createBooklogURL(str) {
  var checkDidit = 11 - (Number(str.charAt(0)) * 10
                         + Number(str.charAt(1)) * 9
                         + Number(str.charAt(2)) * 8
                         + Number(str.charAt(3)) * 7
                         + Number(str.charAt(4)) * 6
                         + Number(str.charAt(5)) * 5
                         + Number(str.charAt(6)) * 4
                         + Number(str.charAt(7)) * 3
                         + Number(str.charAt(8)) * 2) % 11;
  if (checkDidit == 11) {
	checkDidit = 0;
  } else if (checkDidit == 10) {
	checkDidit = "X";
  }

  return "http://booklog.jp/item/1/" + str + checkDidit.toString();
}

function strLenJ(str) {//2バイト文字は2として文字数をカウント
  var len = 0;
  str = escape(str);
  for (var i = 0; i < str.length; i++, len++) {
    if (str.charAt(i) == "%") {
      if (str.charAt(++i) == "u") {
        i += 3;
        len++;
      }
      i++;
    }
  }
  return len;
}

function sleep( waitMilliSeconds ) {
	var startTime = ( new Date( ) ).getTime( );
	while ( true ) {
		if ( ( new Date( ) ).getTime( ) >= (startTime + waitMilliSeconds) ) {
			break;
		}
	}
}
