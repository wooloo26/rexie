import * as PIXI from 'pixi.js'
import {
    h,
    memo,
    useRef,
    useEffect,
    useTransition,
    FC,
    useContext,
    useCallback,
    useMemo,
} from 'rexie'

import { Loading } from '../../components/Loading'
import { AppContext } from 'examples'

export const Tinting: FC<{
    screen: { width: number; height: number }
}> = memo(({ screen }) => {
    const texture = useRef<PIXI.Texture>()
    const totalDudes = 20
    const app = useContext(AppContext)
    const dudes = useRef<PIXI.Sprite[]>([])
    const container = useRef<PIXI.Container>()
    const dudeBounds = useMemo(() => {
        const dudeBoundsPadding = 100
        return new PIXI.Rectangle(
            -dudeBoundsPadding,
            -dudeBoundsPadding,
            screen.width + dudeBoundsPadding * 2,
            screen.height + dudeBoundsPadding * 2,
        )
    })
    const [isPending, startTransitioin] = useTransition()
    const animate = useCallback(() => {
        for (let i = 0; i < dudes.current.length; i++) {
            const dude = dudes.current[i]

            dude.rotation += 0.01
            dude.x += Math.sin(dude.rotation)
            dude.y += Math.cos(dude.rotation)

            if (dude.x < dudeBounds.x) {
                dude.x += dudeBounds.width
            } else if (dude.x > dudeBounds.x + dudeBounds.width) {
                dude.x -= dudeBounds.width
            }

            if (dude.y < dudeBounds.y) {
                dude.y += dudeBounds.height
            } else if (dude.y > dudeBounds.y + dudeBounds.height) {
                dude.y -= dudeBounds.height
            }
        }
    }, [dudes.current])

    useEffect(() => {
        startTransitioin(async () => {
            texture.current = await PIXI.Assets.load(
                'https://pixijs.com/assets/eggHead.png',
            )
        })
    }, [])

    useEffect(() => {
        app.ticker.add(animate)
        return () => {
            app.ticker.remove(animate)
        }
    }, [dudes.current])

    return (
        <container>
            <container ref={container}>
                {isPending ? (
                    <Loading />
                ) : (
                    new Array(totalDudes).fill(null).map((_, index) => (
                        <sprite
                            ref={el => {
                                dudes.current[index] = el
                                dudes.current = dudes.current.slice()
                            }}
                            options={texture.current}
                            anchor={0.5}
                            scale={0.8 + Math.random() * 0.3}
                            x={Math.random() * screen.width}
                            y={Math.random() * screen.height}
                            tint={Math.random() * 0xffffff}
                            rotation={Math.random() * Math.PI * 2}
                        />
                    ))
                )}
            </container>
        </container>
    )
})
