import {FC, Suspense, useState} from 'react'
import {ChevronLeft, ChevronRight} from 'heroicons-react'

import {useUndoable} from 'utils/hooks/state/useUndoable'
import {DirectoryList} from './DirectoryList'

export const DirectoryChooser: FC = () => {
  const [path, setPath, {undo, redo, past, future}] = useUndoable(useState('/Users/dylan/dev'))

  return (
    <>
      <nav className="relative z-0 flex border-b border-gray-200">
        <button
          onClick={() => undo()}
          type="button"
          className="relative inline-flex items-center p-2 text-sm font-medium leading-5 text-gray-500 transition duration-150 ease-in-out border-r border-gray-200 hover:text-gray-400 focus:z-10 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:bg-gray-100 active:text-gray-500"
          aria-label="Previous">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="relative inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium leading-5 text-gray-700">
          {path}
        </span>
        <button
          onClick={() => redo()}
          type="button"
          className="relative inline-flex items-center p-2 text-sm font-medium leading-5 text-gray-500 transition duration-150 ease-in-out border-l border-gray-200 hover:text-gray-400 focus:z-10 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:bg-gray-100 active:text-gray-500"
          aria-label="Next">
          <ChevronRight className="w-5 h-5" />
        </button>
      </nav>

      <Suspense fallback={null}>
        <DirectoryList path={path} setPath={setPath} />
      </Suspense>
    </>
  )
}
