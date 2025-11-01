const db = require("./db");
const { collection, setDoc, doc } = require('firebase/firestore');

const buildings = [
  {
    id: "학생회관",
    name: "학생회관",
    stores: ["홍대쌀국수", "공여사&덮다", "대한짜장", "하즈벤", "수오미엔"],
  },
  {
    id: "향2",
    name: "향2",
    stores: ["또바기육개장", "엄가네해장국", "아리랑핫도그", "크앙분식"],
  },
  {
    id: "향3",
    name: "향3",
    stores: ["라면집"],
  },
];

// 🔹 Firestore에 추가
async function uploadBuildings() {
  try {
    for (const building of buildings) {
      const ref = doc(db, "buildings", building.id); // id를 문서 이름으로 사용
      await setDoc(ref, {
        name: building.name,
        stores: building.stores,
      });
      console.log(`✅ ${building.id} 문서 업로드 완료`);
    }
  } catch (error) {
    console.error("❌ 업로드 중 오류 발생:", error);
  }
}

uploadBuildings();