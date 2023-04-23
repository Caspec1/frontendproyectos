import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import useProyectos from "../hooks/useProyectos";
import Alerta from '../components/Alerta'

const FormularioProyecto = () => {

  const { mostrarAlerta, alerta, submitProyecto, proyecto } = useProyectos()

  const [id, setId] = useState(null);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fechaEntrega, setFechaEntrega] = useState("");
  const [cliente, setCliente] = useState("");

  const params = useParams()

  useEffect(() => {
    if(params.id) {
      setId(proyecto._id)
      setNombre(proyecto.nombre)
      setDescripcion(proyecto.descripcion)
      setFechaEntrega(proyecto.fechaEntrega?.split('T')[0])
      setCliente(proyecto.cliente)
    }
  }, [params])

  const handleSubmit = async e => {
    e.preventDefault()

    if([nombre, descripcion, fechaEntrega, cliente].includes('')) {
        return mostrarAlerta({
            msg: 'Todos los campos son obligatorios',
            error: true
        })
    }

    await submitProyecto({id, nombre, descripcion, fechaEntrega, cliente})

    setId(null)
    setNombre('')
    setDescripcion('')
    setFechaEntrega('')
    setCliente('')
  }

  const { msg } = alerta

  return (
    <form className="bg-white py-10 px-5 md:w-1/2 rounded-lg shadow" onSubmit={handleSubmit}>

        {msg && <Alerta alerta={alerta} />}

      <div className="mb-5">
        <label
          htmlFor="nombre"
          className="text-gray-700 uppercase font-bold text-sm"
        >
          Nombre Proyecto
        </label>
        <input
          type="text"
          className="border w-full p-2 mt-2 placeholder-gray-400 rounded-md"
          id="nombre"
          placeholder="Nombre del Proyecto"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
      </div>

      <div className="mb-5">
        <label
          htmlFor="descripcion"
          className="text-gray-700 uppercase font-bold text-sm"
        >
          Descripción
        </label>
        <textarea
          type="text"
          className="border w-full p-2 mt-2 placeholder-gray-400 rounded-md"
          id="descripcion"
          placeholder="Descripcion del Proyecto"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        />
      </div>

      <div className="mb-5">
        <label
          htmlFor="fecha-entrega"
          className="text-gray-700 uppercase font-bold text-sm"
        >
          Fecha de Entrega
        </label>
        <input
          type="date"
          className="border w-full p-2 mt-2 placeholder-gray-400 rounded-md"
          id="fecha-entrega"
          value={fechaEntrega}
          onChange={e => setFechaEntrega(e.target.value)}
        />
      </div>

      <div className="mb-5">
        <label
          htmlFor="cliente"
          className="text-gray-700 uppercase font-bold text-sm"
        >
          Nombre del Cliente
        </label>
        <input
          type="text"
          className="border w-full p-2 mt-2 placeholder-gray-400 rounded-md"
          id="cliente"
          placeholder="Nombre del Cliente"
          value={cliente}
          onChange={e => setCliente(e.target.value)}
        />
      </div>

      <input 
      type="submit"
      className="bg-sky-600 hover:bg-sky-800 w-full p-3 uppercase font-bold text-white transition-colors rounded hover:cursor-pointer"
      value={`${id ? 'Actualizar Proyecto' : 'Crear proyecto'}`}
      />
    </form>
  );
};

export default FormularioProyecto;
