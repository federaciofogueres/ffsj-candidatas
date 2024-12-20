import { inject, Injectable } from '@angular/core';
import { collection, doc, Firestore, getDocs, setDoc } from '@angular/fire/firestore';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from '@angular/fire/storage';
import { CandidataData } from '../model/candidata-data.model';

@Injectable({
    providedIn: 'root'
})
export class FirebaseStorageService {

    private _firestore = inject(Firestore);
    private _firebaseApp = this._firestore.app;
    private _collection = collection(this._firestore, 'candidatas');
    private _storage = getStorage(this._firebaseApp, 'gs://ffsj-form-candidatas.appspot.com');

    constructor() { }

    uploadFile(filePath: string, file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const fileRef = ref(this._storage, filePath);
            const task = uploadBytesResumable(fileRef, file);

            task.on('state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log(`Upload is ${progress}% done`);
                    switch (snapshot.state) {
                        case 'paused':
                            console.log('Upload is paused');
                            break;
                        case 'running':
                            console.log('Upload is running');
                            break;
                    }
                }, (error) => {
                    console.error('Error uploading file -> ', error);
                    reject(error);
                }, () => {
                    getDownloadURL(task.snapshot.ref).then((downloadURL: string) => {
                        resolve(downloadURL);
                    });
                }
            );
        });
    }

    async addCandidata(candidata: CandidataData) {
        const candidataValues = this.extractValues(candidata);
        await setDoc(doc(this._firestore, `candidatas/2024/${candidataValues.tipoCandidata}`, candidataValues.asociacion), candidataValues);
    }

    async getCollection(collectionName: string) {
        const colRef = collection(this._firestore, collectionName);
        const snapshot = await getDocs(colRef);
        const docs = snapshot.docs.map(doc => doc.data());
        return docs;
    }

    extractValues(candidata: CandidataData) {
        return {
            id: candidata.id.value,
            dni: candidata.informacionPersonal.dni.value,
            nombre: candidata.informacionPersonal.nombre.value,
            fechaNacimiento: candidata.informacionPersonal.fechaNacimiento.value,
            ciudad: candidata.informacionPersonal.ciudad.value,
            email: candidata.informacionPersonal.email.value,
            telefono: candidata.informacionPersonal.telefono.value,
            edad: candidata.informacionPersonal.edad.value,
            tipoCandidata: candidata.informacionPersonal.tipoCandidata.value,
            asociacion: candidata.vidaEnFogueres.asociacion.value,
            anyosFiesta: candidata.vidaEnFogueres.anyosFiesta.value,
            curriculum: candidata.vidaEnFogueres.curriculum.value,
            formacion: candidata.academico.formacion.value,
            situacionLaboral: candidata.academico.situacionLaboral.value,
            observaciones: candidata.academico.observaciones.value,
            aficiones: candidata.academico.aficiones.value,
            autorizacionFoguera: candidata.documentacion.autorizacionFoguera.value,
            compromisoDisponibilidad: candidata.documentacion.compromisoDisponibilidad.value,
            derechosAutor: candidata.documentacion.derechosAutor.value,
            dniEscaneado: candidata.documentacion.dniEscaneado.value,
            fotoBelleza: candidata.documentacion.fotoBelleza.value,
            fotoCalle: candidata.documentacion.fotoCalle.value,
            nombreTutor1: candidata.responsables.nombreTutor1.value,
            nombreTutor2: candidata.responsables.nombreTutor2.value,
            telefonoTutor1: candidata.responsables.telefonoTutor1.value,
            telefonoTutor2: candidata.responsables.telefonoTutor2.value
        }
    };
}