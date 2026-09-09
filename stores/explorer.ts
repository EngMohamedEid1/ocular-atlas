import { defineStore } from 'pinia'

export const useExplorerStore = defineStore('explorer', {
  state: () => ({ language: 'en' as 'ar' | 'en', exploded: false, retinaExpanded: false, opacity: 100, saturation: 125, pathology: 'Normal retina', imaging: 'OCT', colorSafe: false, quiz: false, selectedId: 'sclera', activeTool: 'none', surgicalMode: 'none' }),
  actions: { select(id: string) { this.selectedId = id }, toggleExplode() { this.exploded = !this.exploded }, toggleRetina() { this.retinaExpanded = !this.retinaExpanded } }
})
