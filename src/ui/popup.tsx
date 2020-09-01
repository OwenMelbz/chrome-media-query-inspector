import * as React from "react"
import { useState, useEffect } from "react"
import * as ReactDOM from "react-dom"
import defaultScreens from '../default-screens'

import '../styles/popup.css'

const App = () =>{
    const [loaded, setLoaded] = useState(false)
    const [saving, setSaving] = useState(false)
    const [screens, setScreens] = useState(defaultScreens)
    const [enabled, setEnabled] = useState(false)
    const [newScreen, setNewScreen] = useState({
        value: '',
        label: '',
    })

    const loadState = () => {
        chrome.storage.sync.get(['enabled', 'screens'], function(result) {
            setScreens(result.screens || defaultScreens)
            setEnabled(result.enabled || false)
            setLoaded(true)
        })
    }

    const broadcast = (enabled, screens) => {
        chrome.runtime.sendMessage({
            type: 'CONFIG_UPDATED',
            data: {
                enabled,
                screens,
            }
        });
    }

    const toggleEnable = () => {
        setSaving(true)

        requestAnimationFrame(async () => {
            const newState = !enabled

            await setEnabled(newState)

            chrome.storage.sync.set({
                enabled: newState
            }, () => {
                setSaving(false)
                broadcast(newState, screens);
            })
        })
    }

    const updateScreen = (item, value, field) => {
        const newScreens = [...screens]
        newScreens[item][field] = value

        setScreens(
            newScreens.filter(screen => screen.value || screen.label)
        )
    }

    const save = () => {
        setSaving(true)

        requestAnimationFrame(() => {
            const newScreens = [...screens]

            if (newScreen.value && newScreen.label) {
                newScreens.push({...newScreen})
                setScreens(newScreens.filter(screen => screen.value || screen.label))
                setNewScreen({
                    value: '',
                    label: '',
                })
            }

            chrome.storage.sync.set({
                screens: [...newScreens],
            }, () => {
                setSaving(false)
                broadcast(enabled, newScreens)
            })
        })
    }

    useEffect(() => {
        loadState()
    }, [])

    if (!loaded) {
        return <div>
            <div className="bg-indigo-900 text-center py-4 lg:px-4">
                <div className="animate-pulse p-2 bg-indigo-800 items-center text-indigo-100 leading-none lg:rounded-full flex lg:inline-flex" role="alert">
                    <span className="flex rounded-full bg-indigo-500 uppercase px-2 py-1 text-xs font-bold">Loading</span>
                </div>
            </div>
        </div>
    }

    return (
            <div className={'p-6 max-w-sm'}>

                <div>
                    <label htmlFor="enabled" className="flex items-center cursor-pointer">
                        <div className="relative">
                            <input checked={ enabled } onChange={ toggleEnable } id="enabled" type="checkbox" className="hidden"/>
                            <div className="toggle__line w-10 h-4 bg-gray-400 rounded-full shadow-inner"/>
                            <div className="toggle__dot absolute w-6 h-6 bg-white rounded-full shadow inset-y-0 left-0"/>
                        </div>
                        <div className="ml-3 font-medium">
                            { enabled ? 'Enabled' : 'Disabled' }
                        </div>
                    </label>
                </div>

                <div className={'mt-10'}>
                    <table className={'w-full'}>
                        <thead>
                            <tr>
                                <th className={'text-left py-2'}>
                                    Label
                                </th>
                                <th className={'text-left py-2 pl-2'}>
                                    Media Query
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                        { screens.map((screen, i) => <tr key={i}>
                                <td style={{ width: 80 }} className={'text-left py-2'}>
                                    <input
                                        onChange={e => updateScreen(i, e.target.value, 'label')}
                                        autoComplete={'off'} type="text" value={ screen.label }
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                                </td>
                                <td className={'text-left py-2 pl-2'}>
                                    <input
                                        onChange={e => updateScreen(i, e.target.value, 'value')}
                                        autoComplete={'off'} type="text" value={ screen.value }
                                       className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                                </td>
                            </tr>
                        )}
                        <tr>
                            <td style={{ width: 80 }} className={'text-left py-2'}>
                                <input onChange={e => setNewScreen({
                                    value: newScreen.value,
                                    label: e.target.value,
                                })} autoComplete={'off'} type="text" value={ newScreen.label } placeholder={'e.g. xxl'}
                                       className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                            </td>
                            <td style={{ width: 200 }} className={'text-left py-2 pl-2'}>
                                <input onChange={e => setNewScreen({
                                    value: e.target.value,
                                    label: newScreen.label,
                                })} autoComplete={'off'} type="text" value={ newScreen.value } placeholder={'e.g. (min-width: 4000px)'}
                                       className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                            </td>
                        </tr>
                        <tr>
                            <td className={'text-right py-2'} colSpan={2}>
                                <button
                                    onClick={save}
                                    className={'bg-indigo-700 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded'}
                                >
                                    { saving ? 'Saving' : 'Save' }
                                </button>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>

                <div className={'mt-6'}>
                    <h2 className={'font-bold'}>Tips:</h2>
                    <ul className={'ml-4 mt-4 list-disc text-xs'}>
                        <li className={'mb-2'}>Make sure your media queries do not cross over.</li>
                        <li className={'mb-2'}>To delete a media query remove the text from both the label and media query fields.</li>
                    </ul>
                </div>

            </div>
        )
}

ReactDOM.render(
    <App />,
    document.getElementById('root')
)
