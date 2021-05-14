import React from 'react'
import { VariableSizeGrid as Grid } from 'react-window'
import { debounce } from 'lodash'
import { getData } from './api'
import { Data, Size } from './types'

import './App.css';

const PAGE_SIZE = 20

const nestifyArray = (arr: any[], nestedLength: any): any[][] => {
  const newLength = Math.ceil(arr.length / nestedLength)
  const newArr = []
  let tempArr: any[] = []
  for (let i = 0; i < arr.length; i++) {
    tempArr.push(arr[i])
    if (tempArr.length === nestedLength) {
      newArr.push(tempArr)
      tempArr = []
    }
  }
  return newArr
}

function Item(props: Record<string, any>) {
  const { data, style, rowIndex, columnIndex, incrementPage } = props
  const [loaded, setLoaded] = React.useState(false)

  if (rowIndex === data.length - 1) {
    incrementPage()
  }
  
  const onImgLoad = () => {
    setLoaded(true)
  }

  return (
    <div
      style={{
        ...style,
        padding: 16,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <img className="image" src={data[rowIndex][columnIndex].thumbnail_url} onLoad={onImgLoad} alt="" />
      {!loaded && (
        <img height="30" width="30" style={{ border: 0 }} src="data:image/gif;base64,R0lGODlhHgAgAOMAAAQCBISChERGRMzOzOzq7CQmJFxeXBQSFPz+/AwKDJyenExOTOTm5PTy9GRiZP///yH/C05FVFNDQVBFMi4wAwEAAAAh+QQJCQAPACwAAAAAHgAgAAAERfDJSSUxJ4lRu69NAYxAwn0oFZCkkL6PwJJwusxljSq4oX+IG6nA+AEVC0GAYGw6n9CodEqtWq/YrHbL7Xq/4LB4TOZGAAAh+QQJCQAWACwAAAAAHgAgAIQEAgSEgoREQkTMysxcXlwkJiTk5uQMDgxMTkz8/vwMCgycnpxMSkz08vQEBgSEhoRERkTMzsxkYmTs6uwUEhRUUlT///8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFS6AljuQYCcohGWXrloMCzEAxvXgp0HSQ/xYHbwYB5g5DAMKIIyQXzJehwEMkoq/JA4JYXLHgsHhMLpvP6LR6zW673/C4fE6v2+/tEAAh+QQJCQAXACwAAAAAHgAgAIQEAgSEhoREQkTExsQkIiSkpqRsamz09vQMCgxUUlSMjozc2twsLiy8vrwEBgRERkTMzsysqqz8/vwMDgxUVlSUkpQ0NjT///8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFS+AljmRZMAChSGXrlhUgy8Zrl8c0z9HtD7tZwneDBGUPok1COAaUtgZiZzlAbQuDgKKwXr/gsHhMLpvP6LR6zW673/C4fE6v2+/KEAAh+QQJCQAVACwAAAAAHgAgAIQEAgScmpxEQkTU0tQkIiQUEhRcXlz09vTExsTc3twMCgykpqRMSkwEBgRERkTU1tQ0NjQcGhx0cnTk4uSsrqz///8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFSWAljmRZHchjrmy5FAAAJW1NInFeqHZt5DlBr+YAxhrDlsQIiCRZExgw8GQNHI2Cg1Lter/gsHhMLpvP6LR6zW673/C4fE5PhwAAIfkECQkAGAAsAAAAAB4AIACEBAIEhIKEREZExMLE5OLkZGZkJCIk9PL0FBIUfHp8pKKkVFZU3N7c/P78DAoMTE5MzMrM7O7sbG5sPD489Pb0HB4cfH58rKqs////AAAAAAAAAAAAAAAAAAAAAAAAAAAABUkgJo5kKTJDZK4sSS1AbKltPUpxXjG2jeS5Qq8GzAmGrUcRkECyGAbg5OBkHRSWy6BR7Xq/4LB4TC6bz+i0es1uu9/wuHxOR4cAACH5BAkJABQALAAAAAAeACAAhAQCBISChMTCxERGRGxqbJyenOTm5FxaXPT29IyKjHx6fKyurAQGBISGhExOTHRydKSmpOzq7FxeXPz+/P///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVGICWOZGmeaCoWjgOpMPkANEAgsWowNe3guZOgV1METxEibXA8BZSN5mlxqA4aE6l2y+16v+CweEwum8/otHrNbrvf8DglBAAh+QQJCQAXACwAAAAAHgAgAIQEAgSEhoTExsQ8Pjzs7uykoqRcXlz8+vwcGhy8urxUVlT09vSsrqx0dnQMDgyMiozk4uRERkT08vSkpqRkYmT8/vwsKiz///8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFS+AljmRpnmg6JgFzqDBpAHS0xHBC78qNo4HdjlL5nQrC3cRoWliSgAfTRGhEBg4AAjJNSQSErnhMLpvP6LR6zW673/C4fE6v2+/sEAAh+QQJCQATACwAAAAAHgAgAIQEAgSUlpQ0NjTMzswcHhzk4uQUEhRUUlTs6uysqqw0MjQMCgxMTkwkIiTk5uQcGhxkZmTs7uy0trT///8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFR+AkjmRpnmiqrmzwLIzDsglgA4o8p8xtG4gd6uCzMSJCk6RogyRNCcXDx3iiCgEDYWDter/gsHhMLpvP6LR6zW673/C4vBwCACH5BAkJABkALAAAAAAeACAAhAQCBIyKjMTGxDQ2NBwaHPz6/LS2tNTW1BQWFFRWVCQmJAwKDKSmpMTCxNze3AQGBJSSlMzKzDw+PCQiJPz+/Ly6vGRiZCwqLOTi5P///wAAAAAAAAAAAAAAAAAAAAAAAAVMYCaOZGmeaKqurFgITtseEwBYhaxKts3oqUcPgBAAT5chYHA0GYTDX5PkgCSGjanpoLAFtKYKQoEBm8/otHrNbrvf8Lh8Tq/b73hzCAAh+QQJCQAYACwAAAAAHgAgAIQEAgSEhoTExsQ8Pjysqqzs6ux0cnRMTkw8Ojy8urz09vQMCgycnpzc2txUVlT8/vyMiozMzsxMSkysrqxUUlS8vrz8+vwMDgz///8AAAAAAAAAAAAAAAAAAAAAAAAAAAAFUSAmjmRpnmiqrmzrmk3AKK8qLAAwPDXq5DlC73QA5ibDUsIIQNCSI4EBlwtASxFEjvK8igpFgMRLWgIW5JFCAoCk3/C4fE6v2+/4vH7P7/vjIQAh+QQJCQAcACwAAAAAHgAgAIQEAgSEgoQ8PjzEwsTk4uQcGhwMDgxkZmSsqqzU1tRERkT09vQMCgycmpwUFhTc3twEBgSMioxEQkTExsTs6uwsLiwUEhR0dnS0trTc2txMSkz8+vz///8AAAAAAAAAAAAFUiAnjmRpnmiqrmzrvnBJHRoSpwqgD/cJ6QDBo1eSAINEEuFg0BkSSRKmCXBsoqOHDrLAjhqKS8Y7CuzIHCMggMZYKgS0fE6v2+/4vH7P7/v/LyEAIfkECQkAHwAsAAAAAB4AIACEBAIEhIKExMLEREJEpKak3N7cLCosbG5sDA4MjI6MtLK07O7szM7MVFZUDAoMjIqMTEpMrK6s9Pb0BAYEhIaEzMrMREZErKqs5OLkdHJ0FBYUlJKUvLq89PL01NLU////BVjgJ45kaZ5oqq5s675wLM90PR7OsNijB/wbnqjwAxCEIoLFkhEgPx0HACFBLn6TzvPSiDxFCQjnyfhpnkSA4SsIFL7wuKj9RhYmarL5+7CM5YCBgoOEhSkhACH5BAkJACIALAAAAAAeACAAhQQCBISChMTCxERCRCQmJOTi5KSipGRmZAwODNTW1DQ2NPz6/JSWlLy+vAwKDFxeXCwuLOzu7KyqrHR2dNze3AQGBIyKjMTGxERGRCwqLOTm5BQSFNza3Dw6PPz+/JyenKyurHx6fP///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAZiQJFwSCwaj8ikcslsOp/QqHRKrVqv2GxEgfhkRR8AgPBNOACHr4gi8Kg9h4zh2xA7vpwKQKFOfCJqgSIaEwxqGGJzWQNiXlkcDyFugpSVVBQXahd6E18WYnxZBRkIIJanIkEAIfkECQkAIAAsAAAAAB4AIACFBAIEjIqMzMrMVFJU5ObkHB4cpKKk3N7cbGpsrK6sHBoc1NLU9PL0LC4sDAoMnJ6cXF5cfH58tLa0/Pr8lJKUzM7MVFZUJCIkrKqs5OLkbG5stLK01NbU9Pb0NDY0DA4M////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABl5AkHBILBqPyKRyyWw6n9CodEqtWq/YrNa4yGwjAEdF6wEAKFqMo0HYuoUJzULLMRe0C7Ni+4AI3oBaGRITWgcOAANaG3paHQMKD4GTTx0UBlsIZpJZA2YBhgMIDEpBACH5BAkJACIALAAAAAAeACAAhQQCBISChMTGxExKTOTm5CQiJKyqrNTW1PT29BQSFJSSlDQyNLy6vNze3AwODIyKjHRydOzu7CwqLPz+/AQGBISGhMzOzLSytNza3Pz6/BwaHJyenDw+PLy+vOTi5Hx+fPTy9CwuLP///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAZjQJFwSCwaj8ikcslsOp/QqHRKrVqv2Kx2y116DtsOBaDQfgCAgRZTcDC63Exmu6EUPNoF+qGtABxgaxFwhFYTIFsREgABWgZoGlEeFkcEGgAQUAJjjUYgDVEPaBxaHhIOF09BACH5BAkJACIALAAAAAAeACAAhQQCBISGhMTGxERGRCQmJOTm5KSmpNza3DQ2NBweHJSWlGRiZAwKDMzOzCwuLPz6/IyOjMTCxHx6fAQGBMzKzExKTCwqLPTy9KyqrOTi5Dw+PJyenGxubAwODNTS1DQyNPz+/JSSlP///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAZiQJFwSCwaj8ikcslsOp/QqHRKrVqv2Kx2y+16mQ/BZTsAJLQPgHorAQy4oK82Etkq1BvtQs3RehwOB3KDRAEaGEhxUB5qDA9FBRYdBlAZEwAERiFqH1ENEBlGDZcSWwUUSkEAIfkECQkAHAAsAAAAAB4AIACEBAIEjIqMzMrMREZE5ObkpKakHB4c9Pb0bGps1NbU7O7stLK0DAoMlJKUVFZULCos3N7cjI6MTEpM7OrsrK6sJCIk/P78fHp83Nrc9PL0tLa0DA4M////AAAAAAAAAAAABV0gJ45kaZ5oqq5s675wLM90bd94ru987//AYOmAcGB0EQDAoSsoEbtCIyP8TY4vAkWBEigjroMBULGcAsqBC6IEcE2QyobyuhgCKjOpMdDoEkobejcEShU7AgEQLyEAIfkECQkAHgAsAAAAAB4AIACEBAIEhIKExMbEREZE5ObkHB4c1NbUbGpsFBIUpKak9Pb0XFpc3N7cDAoMjI6MNDI0/P78BAYEzM7MVFJU9PL03NrcfH58HBocrKqs/Pr8ZGJk5OLklJKUNDY0////AAAABVagJ45kaZ5oqq5s675wLM90bd94ru987/8uBSexOwAAxNzk6NAZLgCLThE5bnIZaIOiYzgMvgxjp3gAJjrJEQDJKTqAxS5DSLV1mUFEmhMcIzoUUGgsIQAh+QQJCQAdACwAAAAAHgAgAIQEAgSMiow8PjzExsTs6uwkJiRcWlzc2twMDgy8urxMSkz8+vw0MjTMzszk4uQUFhRUUlQEBgSkpqTMysz08vQsKix0cnTc3twUEhTEwsRMTkz8/vw0NjT///8AAAAAAAAFU2AnjmRpnmiqrmzrvnAsz3Rt33iu7+wyEDsOANHQAY4WHeIo0QkAkYvucUzoJAXNQrd4GnSNI4CSWzAAmt1CyhNlAmzc4VjRDY6YXUBhbfv/gDQhACH5BAkJABYALAAAAAAeACAAhAQCBISChFRSVNTS1GxubOzu7CQmJGRiZNza3BQSFFxaXHx+fPz6/DQ2NAwKDJSWlFRWVNTW1HRydCwuLNze3Pz+/P///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVIoCWOZGmeaKqubOu+cCzPdG3feK6nyOQsOgVgGMkJhoBBbjEU6I4AYI4wfASHAV2k4aDoKhOAgZErIL1TwGHHbrvf8Lh8HgsBACH5BAkJABMALAAAAAAeACAAhAQCBHx6fERGRLS2tGxqbOTm5BwaHKyurFRWVMzKzAwKDIyOjAQGBHx+fExOTMTCxHRydFxaXMzOzP///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVJ4CSOZGmeaKqubOu+cCzPdG3LD+IctygxgCDvBgkGHb2AEYDoLYyMRK9hHPQmgqDhOiEEm1cvgMAtRBAFrnrNbrvf8Lh8Tq+HAAAh+QQJCQAUACwAAAAAHgAgAIQEAgSEhoTEwsTk4uRMSky0trQkIiSUkpTc3tz08vTMzsxcXlwMCgyMiozExsTs7uw0MjSUlpT8+vxkYmT///8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFSSAljmRpnmiqrmzrvnAsz7T4CENdRgwATBIdReErNoSNoo8gPCgBC2HgqRAWioaqMGEAQBDC0cORCJvP6LR6zW673/C4fE4XhQAAIfkECQkAEQAsAAAAAB4AIACEBAIEjIqMxMbETEpM7O7sJCYkzM7MDAoMvL68bGps/P78BAYEzMrMVFZU9Pb01NLUxMLE////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABVBgJI5kaZ5oqq5s676iMRzHwMAncgA8sCA4kqLQ6xUUQdGjWHwkIxBmD/IkSHmEZyQhTWgjjkax4fiKBIGAwMxuu9/wuHxOr9vv+Lx+z3eHAAAh+QQJCQASACwAAAAAHgAgAIQEAgSMjoxMTkwcHhzU0tSUlpRsbmwsLiwcGhz08vR0dnQEBgSUkpQsKiycmpx0cnQ0NjT09vT///8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFSqAkjmRpnmiqrmw7EkFAuKsB3IBBowWOFztTw3drBEsL4u1IQigRzNFD+YiKEhAfJGEVRQICQSDSLZvP6LR6zW673/C4fE6v290hACH5BAkJABEALAAAAAAeACAAhAQCBISGhERGRMzOzCQmJFxeXOzq7BQSFAwKDFRSVPz+/AQGBKSipExKTOTm5GRiZPTy9P///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVJYCSOZGmeaKqqzoMgwrDOEAHcACLPaYDjAl5K8LsthKhEMYc8MZaFpknR+BEc0imjIQgYsuCweEwum8/otHrNbrvf8Lh8Tq/PQgAh+QQJCQAYACwAAAAAHgAgAIQEAgSEhoRERkTMyswsKiz08vQUEhRkYmSkoqTc2twMCgz8/vwcGhx0dnS0srQEBgRMSkzU0tQ8Ojz09vQUFhRsamysqqzk4uT///8AAAAAAAAAAAAAAAAAAAAAAAAAAAAFSiAmjmRpnig2DcOSvqZlAAARwfhA70yBv4fdDvFLCYS0QBHVQAIcy9NltpO4oqaEQGE4+LDgsHhMLpvP6LR6zW673/C4fE6v28shACH5BAkJABEALAAAAAAeACAAhAQCBISGhERGRMzOzCQmJFRWVOzq7BQSFKSipFRSVPz+/AwKDIyKjExKTCwqLGRiZPTy9P///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVJYCSOZGmeaGQ8xyIMaUxCBGADCyzHwX0Lu1jDdwumEkTAwYhCJB/MkwJ5IxiiUkRCELhiv+CweEwum8/otHrNbrvf8Lh8Tq+PQwAh+QQJCQAYACwAAAAAHgAgAIQEAgSMiozMysxERkT09vQcHhzEwsSkpqRsbmyUkpTc2twMDgxUVlT8/vwsLiwEBgSMjozU0tT8+vwkIiR8fnyUlpTc3txcXlz///8AAAAAAAAAAAAAAAAAAAAAAAAAAAAFSiAmjqOVBAapruwIATDASG2tGnFM2Tx25bBCzzYAwoY1hNGBbCkWwEOzZSjAFolprSEQELTgsHhMLpvP6LR6zW673/C4fE6v28shACH5BAkJAA8ALAAAAAAeACAAgwQCBISGhERGRMzOzFxeXCQmJOzq7BQSFFRSVPz+/AwKDKSipExKTGRiZPTy9P///wRF8MlJ02IsOMq7fwkCjEBhfCi3kCSRvo/IAgecCvNoo0Eu7B9DgaUYAIMEhUJgPDqf0Kh0Sq1ar9isdsvter/gsHhMLnsjADs=" />
      )}
    </div>
  )
}

function App() {
  const [columnCount, setColumnCount] = React.useState<number>(3)
  const [gridSize, setGridSize] = React.useState<Size>({ x: 0, y: 0 })
  const gridRef = React.useRef<any>(null);
  const gridWrapperRef = React.useRef<any>(null);
  const [data, setData] = React.useState<Data[]>([])
  const [page, setPage] = React.useState<number>(1)

  const onColumnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsedValue = parseInt(e.target.value)
    const num = isNaN(parsedValue) || parsedValue === 0 ? 1 : parsedValue
    setColumnCount(num)
  };

  const calcGridSize = () => {
    setGridSize({ x: gridWrapperRef.current.offsetWidth, y: gridWrapperRef.current.offsetHeight })
  }

  const handleResize = debounce(() => {
    calcGridSize()
  }, 500)

  const getAndSetData = async () => {
    try {
      const data = await getData(page, PAGE_SIZE)
      setData((prevData => ([ ...prevData, ...data ])))
    } catch (e) {}
  }

  React.useEffect(() => {
    getAndSetData()
    calcGridSize()
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  React.useEffect(() => {
    gridRef.current.resetAfterColumnIndex(0)
    gridRef.current.resetAfterRowIndex(0)
  }, [columnCount, gridSize])

  React.useEffect(() => {
    getAndSetData()
  }, [page])

  return (
    <div className="wrapper">
      <h1>Studio</h1>
      <input type="number" className="column-input" value={columnCount} onChange={onColumnChange} />
      <div ref={gridWrapperRef} className="grid-wrapper">
        <Grid
          itemData={nestifyArray(data, columnCount)}
          ref={gridRef}
          width={gridSize.x}
          height={gridSize.y}
          columnWidth={index => gridSize.x / columnCount}
          columnCount={columnCount}
          rowCount={Math.floor(data.length / columnCount)}
          rowHeight={index => 500}
        >
          {props => Item({
            ...props,
            incrementPage: () => {
              setPage(data.length / PAGE_SIZE + 1)
            }
          })}
        </Grid>
      </div>
    </div>
  )
}

export default App;
