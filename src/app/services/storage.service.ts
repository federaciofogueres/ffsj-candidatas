import { inject, Injectable } from '@angular/core';
import { collection, doc, Firestore, setDoc } from '@angular/fire/firestore';
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
        await setDoc(doc(this._firestore, `candidatas/2024/${candidata.tipoCandidata}`, candidata.asociacion), candidata);
    }

}