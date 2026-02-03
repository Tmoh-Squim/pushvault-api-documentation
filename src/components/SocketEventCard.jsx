function SocketEventCard({ event, direction, description, payload, example, serverResponse, responseData, emittedBy, notes }) {
  const directionColor = direction === 'emit' 
    ? 'bg-green-500/20 text-green-400 border-green-500/50' 
    : 'bg-purple-500/20 text-purple-400 border-purple-500/50'
  
  const directionIcon = direction === 'emit' ? '📤' : '📥'

  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-lg p-6 hover:border-slate-600/70 transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <code className="text-xl font-bold text-cyan-300">{event}</code>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${directionColor}`}>
              {directionIcon} {direction === 'emit' ? 'EMIT' : 'LISTEN'}
            </span>
          </div>
          <p className="text-gray-400 text-sm">{description}</p>
        </div>
      </div>

      {/* Payload */}
      {payload && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-400 mb-2">Payload:</h4>
          <div className="bg-black/50 rounded p-3">
            <code className="text-sm text-yellow-300">
              {typeof payload === 'object' ? JSON.stringify(payload, null, 2) : payload}
            </code>
          </div>
        </div>
      )}

      {/* Emitted By */}
      {emittedBy && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-400 mb-2">Emitted By:</h4>
          <p className="text-sm text-orange-300">{emittedBy}</p>
        </div>
      )}

      {/* Server Response */}
      {serverResponse && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-400 mb-2">Server Response:</h4>
          <div className="bg-black/50 rounded p-3">
            <code className="text-sm text-pink-300">{serverResponse}</code>
            {responseData && (
              <div className="mt-2">
                <pre className="text-xs text-cyan-300">
                  {typeof responseData === 'object' ? JSON.stringify(responseData, null, 2) : responseData}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Example Code */}
      {example && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-400 mb-2">Example:</h4>
          <pre className="bg-black/70 rounded p-4 overflow-x-auto border border-gray-700">
            <code className="text-sm text-gray-200 whitespace-pre">{example}</code>
          </pre>
        </div>
      )}

      {/* Notes */}
      {notes && notes.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-400 mb-2">📝 Notes:</h4>
          <ul className="space-y-2">
            {notes.map((note, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="text-cyan-400 mt-1">•</span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default SocketEventCard
