const db = require("./db");
const { collection, setDoc, doc } = require('firebase/firestore');

const stores = [
  { id: "홍대쌀국수", name: "홍대쌀국수", building: "학생회관", image: "" },
  { id: "공여사&덮다", name: "공여사&덮다", building: "학생회관", image: "" },
  { id: "대한짜장", name: "대한짜장", building: "학생회관", image: "" },
  { id: "하즈벤", name: "하즈벤", building: "학생회관", image: "" },
  { id: "수오미엔", name: "수오미엔", building: "학생회관", image: "" },
  { id: "또바기육개장", name: "또바기육개장", building: "향2", image: "" },
  { id: "엄가네해장국", name: "엄가네해장국", building: "향2", image: "" },
  { id: "아리랑핫도그", name: "아리랑핫도그", building: "향2", image: "" },
  { id: "크앙분식", name: "크앙분식", building: "향2", image: "" },
  { id: "라면집", name: "라면집", building: "향3", image: "" },
];

async function addStores() {
  for (const store of stores) {
    const docRef = doc(db, "stores", store.id);
    await setDoc(docRef, store);
    console.log(`✅ ${store.name} 추가 완료`);
  }
}

addStores();