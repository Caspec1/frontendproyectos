import { useState, useEffect, createContext } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from '../hooks/useAuth'
import clienteAxios from "../config/clienteAxios";
import io from 'socket.io-client'

let socket
const ProyectosContext = createContext();

const ProyectosProvider = ({ children }) => {
  const [alerta, setAlerta] = useState({});
  const [proyectos, setProyectos] = useState([]);
  const [proyecto, setProyecto] = useState({});
  const [cargando, setCargando] = useState(false);
  const [modalFormularioTarea, setModalFormularioTarea] = useState(false);
  const [modalEliminarTarea, setModalEliminarTarea] = useState(false);
  const [modalEliminarColaborador, setModalEliminarColaborador] =
    useState(false);
  const [tarea, setTarea] = useState({});
  const [colaborador, setColaborador] = useState({});
  const [buscador, setBuscador] = useState(false);

  const navigate = useNavigate();
  const {auth} = useAuth()

  useEffect(() => {
    const obtenerProyectos = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) return;

        const config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        };

        const { data } = await clienteAxios("/proyectos", config);

        setProyectos(data);
      } catch (error) {
        console.log(error);
      }
    };
    obtenerProyectos();
  }, [auth]);

  useEffect(() => {
    socket = io(import.meta.env.VITE_BACKEND_URL)
  }, [])

  const submitProyecto = async (proyecto) => {
    if (proyecto.id) {
      await editarProyecto(proyecto);
    } else {
      await nuevoProyecto(proyecto);
    }
  };

  const nuevoProyecto = async (proyecto) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) return;

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      const { data } = await clienteAxios.post("/proyectos", proyecto, config);

      setProyectos([...proyectos, data]);

      setAlerta({
        msg: "Proyecto creado correctamente",
        error: false,
      });

      setTimeout(() => {
        setAlerta({});
        navigate("/proyectos");
      }, 3000);
    } catch (error) {
      console.log(error);
    }
  };

  const editarProyecto = async (proyecto) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) return;

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      const { data } = await clienteAxios.put(
        `/proyectos/${proyecto.id}`,
        proyecto,
        config
      );

      const proyectosActualizados = proyectos.map((proyectoState) =>
        proyectoState._id === data._id ? data : proyectoState
      );

      setProyectos(proyectosActualizados);

      setAlerta({
        msg: "Proyecto actualizado correctamente",
        error: false,
      });

      setTimeout(() => {
        setAlerta({});
        navigate(`/proyectos`);
      }, 3000);
    } catch (error) {
      console.log(error);
    }
  };

  const obtenerProyecto = async (id) => {
    setCargando(true);
    try {
      const token = localStorage.getItem("token");

      if (!token) return;

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      const { data } = await clienteAxios(`/proyectos/${id}`, config);

      setProyecto(data);
      setAlerta({});
    } catch (error) {
      navigate("/proyectos");
      setAlerta({
        msg: error.response.data.msg,
        error: true,
      });
      setTimeout(() => {
        setAlerta({});
      }, 3000);
    } finally {
      setCargando(false);
    }
  };

  const eliminarProyecto = async (id) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) return;

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      const { data } = await clienteAxios.delete(`/proyectos/${id}`, config);

      const proyectosActualizados = proyectos.filter(
        (proyectoState) => proyectoState._id !== id
      );

      setProyectos(proyectosActualizados);

      setAlerta({
        msg: data.msg,
        error: false,
      });

      setTimeout(() => {
        setAlerta({});
        navigate(`/proyectos`);
      }, 3000);
    } catch (error) {
      console.log(error);
    }
  };

  const submitTarea = async (tarea) => {
    if (tarea.ID) {
      await editarTarea(tarea);
    } else {
      await crearTarea(tarea);
    }
  };

  const crearTarea = async (tarea) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) return;

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      const { data } = await clienteAxios.post(`/tareas`, tarea, config);

      setAlerta({});
      setModalFormularioTarea(false);

    //   Socket io
      socket.emit('nueva tarea', data)

    } catch (error) {
      console.log(error);
    }
  };

  const editarTarea = async (tarea) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) return;

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      const { data } = await clienteAxios.put(
        `/tareas/${tarea.ID}`,
        tarea,
        config
      );

      

      setAlerta({});
      setModalFormularioTarea(false);

    //   Socket
        socket.emit('actualizar tarea', data)
    } catch (error) {
      console.log(error);
    }
  };

  const eliminarTarea = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) return;

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      const { data } = await clienteAxios.delete(
        `/tareas/${tarea._id}`,
        config
      );

      setAlerta({
        msg: data.msg,
        error: false,
      });

      setModalEliminarTarea(false);

      //   Socket
        socket.emit('eliminar tarea', tarea)

      setTarea({})
      setTimeout(() => {
        setAlerta({});
      }, 3000);


    } catch (error) {
      console.log(error);
    }
  };

  const submitColaborador = async (email) => {
    setCargando(true);
    try {
      const token = localStorage.getItem("token");

      if (!token) return;

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      const { data } = await clienteAxios.post(
        "/proyectos/colaboradores",
        { email },
        config
      );

      setColaborador(data);

      setAlerta({});
    } catch (error) {
      setAlerta({
        msg: error.response.data.msg,
        error: true,
      });
    } finally {
      setCargando(false);
    }
  };

  const agregarColaborador = async (email) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) return;

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      const { data } = await clienteAxios.post(
        `/proyectos/colaboradores/${proyecto._id}`,
        email,
        config
      );

      setAlerta({
        msg: data.msg,
        error: false,
      });
      setColaborador({});

      setTimeout(() => {
        setAlerta({});
        navigate(`/proyectos/${proyecto._id}`);
      }, 3000);
    } catch (error) {
      setAlerta({
        msg: error.response.data.msg,
        error: true,
      });
    }
  };

  const eliminarColaborador = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) return;

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      const { data } = await clienteAxios.post(
        `/proyectos/eliminar-colaborador/${proyecto._id}`,
        { id: colaborador._id },
        config
      );

      const proyectoActualizado = { ...proyecto };

      proyectoActualizado.colaboradores =
        proyectoActualizado.colaboradores.filter(
          (colaboradorState) => colaboradorState._id !== colaborador._id
        );

      setProyecto(proyectoActualizado);

      setAlerta({
        msg: data.msg,
        error: false,
      });
      setModalEliminarColaborador(false);

      setTimeout(() => {
        setColaborador({});
        setAlerta({});
      }, 3000);
    } catch (error) {
      console.log(error);
    }
  };

  const completarTarea = async (id) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) return;

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      const { data } = await clienteAxios.post(
        `/tareas/estado/${id}`,
        {},
        config
      );

      setTarea({});
      setAlerta({});

    //   Socket
        socket.emit('cambiar estado', data)

    } catch (error) {
      console.log(error.response);
    }
  };

  const mostrarAlerta = (alerta) => {
    setAlerta(alerta);

    setTimeout(() => {
      setAlerta({});
    }, 3000);
  };

  const handleModalTarea = () => {
    setModalFormularioTarea(!modalFormularioTarea);
    setTarea({});
  };

  const handleModalEditarTarea = (tarea) => {
    setTarea(tarea);
    setModalFormularioTarea(true);
  };

  const handleModalEliminarTarea = (tarea) => {
    setTarea(tarea);
    setModalEliminarTarea(!modalEliminarTarea);
  };

  const handleModalEliminarColaborador = (colaborador) => {
    setModalEliminarColaborador(!modalEliminarColaborador);
    setColaborador(colaborador);
  };

  const handleBuscador = () => {
    setBuscador(!buscador);
  };

//   Socket io
  const submitTareaProyecto = tarea => {
    // Agrega la tarea al state

    const proyectoActualizado = { ...proyecto };
    proyectoActualizado.tareas = [...proyectoActualizado.tareas, tarea];
    setProyecto(proyectoActualizado);
  }

  const actualizarTareaProyecto = tarea => {
    const proyectoActualizado = { ...proyecto };
      proyectoActualizado.tareas = proyectoActualizado.tareas.map((tareaState) => (tareaState._id === tarea._id ? tarea : tareaState));

      setProyecto(proyectoActualizado);
  }

  const eliminarTareaProyecto = tarea => {
    const proyectoActualizado = { ...proyecto };
      proyectoActualizado.tareas = proyectoActualizado.tareas.filter((tareaState) => tareaState._id !== tarea._id);
      setProyecto(proyectoActualizado);
  }

  const cambiarEstadoTarea = tarea => {
    const proyectoActualizado = { ...proyecto };
      proyectoActualizado.tareas = proyectoActualizado.tareas.map((tareaState) => (tareaState._id === tarea._id ? tarea : tareaState));
      setProyecto(proyectoActualizado);
  }

  const cerrarSesion = () => {
    setProyectos([])
    setProyecto({})
    setAlerta({})
  }

  return (
    <ProyectosContext.Provider
      value={{
        proyectos,
        mostrarAlerta,
        alerta,
        submitProyecto,
        obtenerProyecto,
        proyecto,
        cargando,
        eliminarProyecto,
        handleModalTarea,
        modalFormularioTarea,
        submitTarea,
        tarea,
        handleModalEditarTarea,
        handleModalEliminarTarea,
        modalEliminarTarea,
        eliminarTarea,
        submitColaborador,
        colaborador,
        agregarColaborador,
        handleModalEliminarColaborador,
        modalEliminarColaborador,
        eliminarColaborador,
        completarTarea,
        handleBuscador,
        buscador,
        submitTareaProyecto,
        eliminarTareaProyecto,
        actualizarTareaProyecto,
        cambiarEstadoTarea,
        cerrarSesion
      }}
    >
      {children}
    </ProyectosContext.Provider>
  );
};

export { ProyectosProvider };

export default ProyectosContext;
