import { ref } from 'vue'

const selectedAlbumFilename = ref<string | null>(null)
const selectedNoteSlug = ref<string | null>(null)

export function selectAlbumPhoto(filename: string) {
  selectedAlbumFilename.value = filename
}

export function useSelectedAlbumPhoto() {
  return selectedAlbumFilename
}

export function selectNote(slug: string) {
  selectedNoteSlug.value = slug
}

export function useSelectedNote() {
  return selectedNoteSlug
}
