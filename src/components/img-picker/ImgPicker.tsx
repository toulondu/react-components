/**
 * 图片上传组件
 * example:
  const data = [
    {
      url: 'someimg1.jpeg',
      id: '1',
    },
    {
      url: 'someimg2.jpeg',
      id: '2',
    },
  ];

  const [files, changeFiles] = useState(data);
  const onChange = (files, type, index) => {
    console.log(files, type, index);
    changeFiles(files);
  };

  <ImgPicker
    files={files}
    onChange={onChange}
    onImageClick={(idx, fs) => console.log(idx, fs)}
    selectable={files.length < 3}
  />
 */
import React, { FC } from "react";
import styled from "styled-components";
import { PhotoSlider } from "react-photo-view";
import "./ImgPicker.css"; //需要引入它自己的css，但它的css里有一个bug，故粘贴出来修改后引入

interface ImageFile {
  url: string;
  [key: string]: any;
}

export interface ImgPickerProps {
  style?: React.CSSProperties; //组件最外层div样式
  files?: Array<ImageFile>; //初始数据
  onChange?: (files: Array<ImageFile>, operationType: string, index?: number) => void;
  onImageClick?: (index?: number, files?: Array<ImageFile>) => void; //点击图片时回调
  onAddImageClick?: (e: React.MouseEvent) => void; //点击添加按钮时回调
  onFail?: (msg: string) => void; //上传失败时回调
  selectable?: boolean; //是否显示添加按钮，比如身份证正反面，上传2张后关闭添加功能
  multiple?: boolean; //同type=file时，input的multiple属性,是否多选
  accept?: string; //同type=file时，input的accept属性，接受文件类型
  capture?: boolean | string; //同type=file时，input的capture属性，调用摄像头相关
  disableDelete?: boolean; // 是否隐藏删除按钮，默认false
}

function noop() {}

const ContainerDiv = styled.div`
  box-sizing: border-box;
  position: relative;
  margin-right: 1%;
  margin-bottom: 5px;
  width: 24%;
  height: 0;
  padding-bottom: 24%;
`;

const ImgBgDiv = styled.div`
  background-size: cover;
  height: 100%;
  width: 100%;
`;

const ImgItem = styled.div`
  position: absolute;
  height: 100%;
  width: 100%;
`;

const ImageGroup = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  flex-wrap: wrap;
`;

const CancelBtn = styled.div`
  width: 1rem;
  height: 1rem;
  position: absolute;
  right: 6px;
  top: 6px;
  text-align: right;
  vertical-align: top;
  z-index: 2;
  background-size: 1rem auto;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.3);
  &::before,
  &::after {
    content: "";
    position: absolute;
    top: 0.2rem;
    height: 0.6rem;
    width: 0.6px;
    right: 0.5rem;
    background: #fff;
  }
  &::after {
    transform: rotate(45deg);
  }
  &::before {
    transform: rotate(-45deg);
  }
`;

const AddBtnDiv = styled(ImgItem)`
  border: 1px solid #dddddd;
  background-color: #ffffff;
  &::before {
    width: 1px;
    height: 1.5rem;
    content: " ";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #cccccc;
  }
  &::after {
    width: 1.5rem;
    height: 1px;
    content: " ";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #cccccc;
  }
`;

const UploadInput = styled.input`
  height: 100%;
  width: 100%;
  opacity: 0;
`;

const ImgPicker: FC<ImgPickerProps> = ({
  files = [],
  onChange = noop,
  onImageClick = noop,
  onAddImageClick = noop,
  onFail = noop,
  selectable = true,
  multiple = false,
  accept = "image/*",
  disableDelete = false,
  capture,
  style,
}) => {
  let fileSelectorInput: HTMLInputElement | null = null;

  // 手机照相时，获取jpeg正确的图片方向，http://stackoverflow.com/questions/7584794/accessing-jpeg-exif-rotation-data-in-javascript-on-the-client-side
  const getOrientation = (file: any, callback: (_: number) => void) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const view = new DataView((e.target as any).result);
      if (view.getUint16(0, false) !== 0xffd8) {
        return callback(-2);
      }
      const length = view.byteLength;
      let offset = 2;
      while (offset < length) {
        const marker = view.getUint16(offset, false);
        offset += 2;
        if (marker === 0xffe1) {
          const tmp = view.getUint32((offset += 2), false);
          if (tmp !== 0x45786966) {
            return callback(-1);
          }
          const little = view.getUint16((offset += 6), false) === 0x4949;
          offset += view.getUint32(offset + 4, little);
          const tags = view.getUint16(offset, little);
          offset += 2;
          for (let i = 0; i < tags; i++) {
            if (view.getUint16(offset + i * 12, little) === 0x0112) {
              return callback(view.getUint16(offset + i * 12 + 8, little));
            }
          }
        } else if ((marker & 0xff00) !== 0xff00) {
          break;
        } else {
          offset += view.getUint16(offset, false);
        }
      }
      return callback(-1);
    };
    reader.readAsArrayBuffer(file.slice(0, 64 * 1024));
  };

  const getRotation = (orientation = 1) => {
    let imgRotation = 0;
    switch (orientation) {
      case 3:
        imgRotation = 180;
        break;
      case 6:
        imgRotation = 90;
        break;
      case 8:
        imgRotation = 270;
        break;
      default:
    }
    return imgRotation;
  };

  const removeImage = (index: number) => {
    const newImages: any[] = [];
    files.forEach((image, idx) => {
      if (index !== idx) {
        newImages.push(image);
      }
    });
    onChange && onChange(newImages, "remove", index);
  };

  const addImage = (imgItem: any) => {
    // const newImages = files.concat(imgItem);
    const newImages = deep(files.concat(imgItem)) as [];
    onChange && onChange(newImages, "add");
  };

  const onImageCk = (index: number) => {
    onImageClick && onImageClick(index, files);
  };

  const onFileChange = () => {
    const fileSelectorEl = fileSelectorInput;
    if (fileSelectorEl && fileSelectorEl.files && fileSelectorEl.files.length) {
      const files = fileSelectorEl.files;
      const imageParsePromiseList: any[] = [];
      for (let i = 0; i < files.length; i++) {
        imageParsePromiseList.push(parseFile(files[i], i));
      }
      Promise.all(imageParsePromiseList)
        .then((imageItems) => addImage(imageItems))
        .catch((error) => {
          onFail && onFail(error);
        });
    }
    if (fileSelectorEl) {
      fileSelectorEl.value = "";
    }
  };

  const parseFile = (file: any, index: number) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataURL = (e.target as any).result;
        if (!dataURL) {
          reject(`获取图片${index}失败`);
          return;
        }

        let orientation = 1;
        getOrientation(file, (res) => {
          // -2: not jpeg , -1: not defined
          if (res > 0) {
            orientation = res;
          }
          resolve({
            url: dataURL,
            orientation,
            file,
          });
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const [visible, setVisible] = React.useState(false);
  const [photoIndex, setPhotoIndex] = React.useState(0);
  function handleCloseSlider() {
    setVisible(false);
  }

  return (
    <div style={style}>
      <ImageGroup>
        {files.map((image, index) => (
          <ContainerDiv key={`img-${index}`}>
            <ImgItem key={index}>
              {!disableDelete && (
                <CancelBtn
                  aria-label="点击删除此图片"
                  onClick={() => {
                    removeImage(index);
                  }}
                />
              )}
              <ImgBgDiv
                aria-label="图片可点击"
                onClick={() => {
                  setPhotoIndex(index);
                  setVisible(true);
                  onImageCk(index);
                }}
                style={{
                  backgroundImage: `url("${image.url}")`,
                  transform: `rotate(${getRotation(image.orientation)}deg)`,
                }}
              />
            </ImgItem>
          </ContainerDiv>
        ))}
        {selectable ? (
          <ContainerDiv key="select">
            <AddBtnDiv onClick={onAddImageClick} aria-label="点击添加图片">
              <UploadInput
                ref={(input) => {
                  if (input) {
                    fileSelectorInput = input;
                  }
                }}
                type="file"
                accept={accept}
                onChange={() => {
                  onFileChange();
                }}
                multiple={multiple}
                capture={capture}
              />
            </AddBtnDiv>
          </ContainerDiv>
        ) : null}
        <PhotoSlider
          images={files.map((item) => ({ src: item.url }))}
          visible={visible}
          onClose={handleCloseSlider}
          index={photoIndex}
          onIndexChange={setPhotoIndex}
          toolbarRender={({ rotate, onRotate }) => {
            return (
              <>
                <svg
                  className="PhotoView-PhotoSlider__toolbarIcon"
                  onClick={() => onRotate(rotate + 90)}
                  width="44"
                  height="44"
                  fill="white"
                  viewBox="0 0 768 768"
                >
                  <path d="M565.5 202.5l75-75v225h-225l103.5-103.5c-34.5-34.5-82.5-57-135-57-106.5 0-192 85.5-192 192s85.5 192 192 192c84 0 156-52.5 181.5-127.5h66c-28.5 111-127.5 192-247.5 192-141 0-255-115.5-255-256.5s114-256.5 255-256.5c70.5 0 135 28.5 181.5 75z" />
                </svg>
                {document.fullscreenEnabled && <FullScreenIcon onClick={toggleFullScreen} />}
              </>
            );
          }}
        />
      </ImageGroup>
    </div>
  );
};

function deep(obj1: any) {
  var obj2: any = Array.isArray(obj1) ? [] : {};
  if (obj1 && typeof obj1 === "object") {
    for (var i in obj1) {
      if (obj1.hasOwnProperty(i)) {
        if (obj1[i] && typeof obj1[i] === "object") {
          obj2[i] = deep(obj1[i]);
        } else {
          obj2[i] = obj1[i];
        }
      }
    }
  }
  return obj2;
}

export default ImgPicker;

const FullScreenIcon = (props: React.HTMLAttributes<any>) => {
  const [fullscreen, setFullscreen] = React.useState<boolean>(false);
  React.useEffect(() => {
    document.onfullscreenchange = () => {
      setFullscreen(Boolean(document.fullscreenElement));
    };
  }, []);
  return (
    <svg
      className="PhotoView-PhotoSlider__toolbarIcon"
      fill="white"
      width="44"
      height="44"
      viewBox="0 0 768 768"
      {...props}
    >
      {fullscreen ? (
        <path d="M511.5 256.5h96v63h-159v-159h63v96zM448.5 607.5v-159h159v63h-96v96h-63zM256.5 256.5v-96h63v159h-159v-63h96zM160.5 511.5v-63h159v159h-63v-96h-96z" />
      ) : (
        <path d="M448.5 160.5h159v159h-63v-96h-96v-63zM544.5 544.5v-96h63v159h-159v-63h96zM160.5 319.5v-159h159v63h-96v96h-63zM223.5 448.5v96h96v63h-159v-159h63z" />
      )}
    </svg>
  );
};

function toggleFullScreen() {
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else {
    const element = document.getElementById("PhotoView_Slider");
    if (element) {
      element.requestFullscreen();
    }
  }
}
