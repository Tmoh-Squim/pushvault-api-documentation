function EndpointCard({ title, method, path, description, protected: isProtected, headers, request, response, notes }) {
  const methodColors = {
    GET: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
    POST: 'bg-green-500/20 text-green-400 border-green-500/50',
    PUT: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
    DELETE: 'bg-red-500/20 text-red-400 border-red-500/50'
  }

  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-purple-500/20 rounded-lg p-6 hover:border-purple-500/40 transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
          <p className="text-gray-400 text-sm">{description}</p>
        </div>
        {isProtected && (
          <span className="ml-4 px-3 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 rounded-full text-xs font-semibold">
            🔒 Protected
          </span>
        )}
      </div>

      {/* Method and Path */}
      <div className="flex items-center gap-3 mb-4">
        <span className={`px-3 py-1 rounded font-bold text-sm border ${methodColors[method] || methodColors.GET}`}>
          {method}
        </span>
        <code className="flex-1 bg-black/50 px-4 py-2 rounded text-purple-300 font-mono text-sm">
          {path}
        </code>
      </div>

      {/* Headers */}
      {headers && Object.keys(headers).length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-400 mb-2">Headers:</h4>
          <div className="bg-black/50 rounded p-3 space-y-1">
            {Object.entries(headers).map(([key, value]) => (
              <div key={key} className="font-mono text-xs">
                <span className="text-blue-400">{key}:</span>{' '}
                <span className="text-gray-300">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Request Body */}
      {request && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-400 mb-2">Request Body:</h4>
          <pre className="bg-black/50 rounded p-4 overflow-x-auto">
            <code className="text-sm text-green-400">{JSON.stringify(request, null, 2)}</code>
          </pre>
        </div>
      )}

      {/* Response */}
      {response && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-400 mb-2">Response:</h4>
          <pre className="bg-black/50 rounded p-4 overflow-x-auto">
            <code className="text-sm text-cyan-400">{JSON.stringify(response, null, 2)}</code>
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
                <span className="text-purple-400 mt-1">•</span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default EndpointCard
