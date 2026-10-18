import type { StateStorage } from "zustand/middleware"

/**
 * localStorage 래퍼. 저장 공간이 가득 찼거나(사진이 많을 때) 사생활 보호 모드처럼
 * 쓸 수 없는 환경에서도 화면이 멈추지 않게 합니다.
 */
export const safeLocalStorage: StateStorage = {
  getItem: (name) => {
    try {
      return localStorage.getItem(name)
    } catch {
      return null
    }
  },
  setItem: (name, value) => {
    try {
      localStorage.setItem(name, value)
    } catch (error) {
      console.warn("저장 공간이 부족해 일부 데이터를 저장하지 못했어요.", error)
    }
  },
  removeItem: (name) => {
    try {
      localStorage.removeItem(name)
    } catch {
      // 저장소를 쓸 수 없는 환경이면 무시합니다.
    }
  },
}
