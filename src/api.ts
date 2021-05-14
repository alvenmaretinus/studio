import { Data, AssetType } from './types'

const getRandomNumber = (min: number, max: number) => {
  return Math.random() * (max - min) + min
};

const data: Data[] = []

for (let i = 0; i < 1000; i++) {
  data.push({
    id: i + 1,
    thumbnail_url: `https://picsum.photos/${Math.round(getRandomNumber(300, 500))}/${Math.round(getRandomNumber(300, 500))}`,
    asset_type: AssetType.IMAGE
  })
}

export const getData = async (page = 1, size = 20): Promise<Data[]> => {
  const paginatedData = data.slice((page - 1) * size, page * size)
  await setTimeout(() => {}, getRandomNumber(50, 150))
  return paginatedData
}
