import { Link } from "react-router-dom"
import useAuth from "../hooks/useAuth"

const PreviewProyecto = ({proyecto}) => {

    const {auth} = useAuth()

    const {nombre, _id, cliente} = proyecto

  return (
    <div className="border-b p-5 flex flex-col md:flex-row justify-between items-center">
      <div className="flex items-center gap-2 mb-3 md:mb-0">
        <p className="flex-1">{nombre} <span className="text-gray-500 uppercase">{cliente}</span></p>
          {auth._id !== proyecto.creador && (
            <p className="p-1 text-xs rounded-lg text-white bg-green-500 font-bold uppercase">Colaborador</p>
          )}
      </div>
        
        <Link to={`${_id}`} className="text-gray-600 hover:text-gray-800 uppercase font-bold text-sm">Ver Proyecto</Link>
    </div>
  )
}

export default PreviewProyecto